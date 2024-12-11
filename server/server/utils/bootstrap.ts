class AppBootstrap {
  private static isInitialized = false;
  static async init() {
    if (this.isInitialized) {
      Logger.warn("Application is already initialized");
      return;
    }
    if (process.client) {
      return;
    }
    try {
      Logger.info("Initializing application...");
      // 初始化数据库连接
      SqliteHelper.init();
      // 初始化所有模型
      modelManager.init();
      this.isInitialized = true;
      Logger.info("Application initialized successfully");
    } catch (error) {
      Logger.error("Failed to initialize application:", error);
      this.isInitialized = false;
    }
  }

  static shutdown() {
    SqliteHelper.close();
    this.isInitialized = false;
  }
}

// 导出单例
export { AppBootstrap };

// 在进程退出时关闭数据库连接
process.on("beforeExit", () => {
  AppBootstrap.shutdown();
});
