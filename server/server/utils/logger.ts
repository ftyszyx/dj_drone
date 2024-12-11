import { appendFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

class Logger {
  private static logDir = join(process.cwd(), "logs");
  private static currentDate: string;

  private static async ensureLogDir() {
    try {
      if (!existsSync(this.logDir)) {
        await mkdir(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
      // 不抛出错误，让程序继续运行
    }
  }

  private static updateCurrentDate() {
    const now = new Date();
    // 使用本地时区
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    this.currentDate = `${year}-${month}-${day}`;
  }

  private static getTime(): string {
    const now = new Date();
    return now.toLocaleString("zh-CN", { hour12: false });
  }

  private static getLogFilePath(type: string): string {
    // 检查是否需要更新当前日期
    this.updateCurrentDate();
    return join(this.logDir, `${type}.${this.currentDate}.log`);
  }

  private static formatMessage(level: string, message: string, ...args: any[]): string {
    const time = this.getTime();
    const formattedArgs = args
      .map((arg) => (arg instanceof Error ? arg.stack || arg.message : typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
      .join(" ");

    return `[${time}] [${level}] ${message} ${formattedArgs}`.trim();
  }

  private static async writeToFile(type: string, message: string) {
    try {
      await this.ensureLogDir();
      const filePath = this.getLogFilePath(type);
      await appendFile(filePath, message + "\n", "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  static async info(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("INFO", message, ...args);
    console.log(formattedMessage);
    await this.writeToFile("app", formattedMessage);
  }

  static async warn(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("WARN", message, ...args);
    console.warn(formattedMessage);
    await this.writeToFile("app", formattedMessage);
  }

  static async error(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("ERROR", message, ...args);
    console.error(formattedMessage);
    await this.writeToFile("error", formattedMessage);
    // 同时写入普通日志文件
    await this.writeToFile("app", formattedMessage);
  }

  static async debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      const formattedMessage = this.formatMessage("DEBUG", message, ...args);
      console.debug(formattedMessage);
      await this.writeToFile("app", formattedMessage);
    }
  }

  // 清理旧日志文件
  static async cleanOldLogs(maxDays = 30) {
    try {
      const files = await import("fs").then((fs) => fs.promises.readdir(this.logDir));
      const now = Date.now();
      const maxAge = maxDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = join(this.logDir, file);
        const stats = await import("fs").then((fs) => fs.promises.stat(filePath));

        if (now - stats.mtime.getTime() > maxAge) {
          await import("fs").then((fs) => fs.promises.unlink(filePath));
        }
      }
    } catch (error) {
      console.error("Failed to clean old logs:", error);
    }
  }
}

export { Logger };
