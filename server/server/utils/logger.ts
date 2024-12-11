import { join } from "path";
import fs from "fs";

class LoggerClass {
  private logDir = join(process.cwd(), "logs");
  private currentDate: string;

  private ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
      // 不抛出错误，让程序继续运行
    }
  }

  private updateCurrentDate() {
    const now = new Date();
    // 使用本地时区
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    this.currentDate = `${year}-${month}-${day}`;
  }

  private getTime(): string {
    const now = new Date();
    return now.toLocaleString("zh-CN", { hour12: false });
  }

  private getLogFilePath(type: string): string {
    // 检查是否需要更新当前日期
    this.updateCurrentDate();
    return join(this.logDir, `${type}.${this.currentDate}.log`);
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const time = this.getTime();
    const formattedArgs = args
      .map((arg) => (arg instanceof Error ? arg.stack || arg.message : typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
      .join(" ");

    return `[${time}] [${level}] ${message} ${formattedArgs}`.trim();
  }

  private writeToFile(type: string, message: string) {
    try {
      this.ensureLogDir();
      const filePath = this.getLogFilePath(type);
      fs.appendFileSync(filePath, message + "\n", "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  info(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("INFO", message, ...args);
    console.log(formattedMessage);
    this.writeToFile("app", formattedMessage);
  }

  warn(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("WARN", message, ...args);
    console.warn(formattedMessage);
    this.writeToFile("app", formattedMessage);
  }

  error(message: string, ...args: any[]) {
    const formattedMessage = this.formatMessage("ERROR", message, ...args);
    console.error(formattedMessage);
    this.writeToFile("error", formattedMessage);
    // 同时写入普通日志文件
    this.writeToFile("app", formattedMessage);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      const formattedMessage = this.formatMessage("DEBUG", message, ...args);
      console.debug(formattedMessage);
      this.writeToFile("app", formattedMessage);
    }
  }

  // 清理旧日志文件
  cleanOldLogs(maxDays = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = maxDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error("Failed to clean old logs:", error);
    }
  }
}

export const Logger = new LoggerClass();
