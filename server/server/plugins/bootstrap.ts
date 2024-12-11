import { AppBootstrap } from "../utils/bootstrap";

export default defineNitroPlugin(async () => {
  try {
    console.log("Initializing application in plugin...");
    await AppBootstrap.init();
  } catch (error) {
    console.error("Failed to initialize application in plugin:", error);
  }
});
