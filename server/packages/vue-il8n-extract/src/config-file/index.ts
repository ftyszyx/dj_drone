import cac from "cac";
import fs from "fs";
import path from "path";
import defaultConfig from "./vue-i18n-extract.config";

export function initCommand(): void {
  fs.writeFileSync(path.resolve(process.cwd(), "./vue-i18n-extract.config.js"), `module.exports = ${JSON.stringify(defaultConfig, null, 2)}`);
}

export function resolveConfig(): Record<string, string> {
  const argvOptions = cac().parse(process.argv, { run: false }).options;

  let options;

  try {
    const pathToConfigFile = path.resolve(process.cwd(), "./vue-i18n-extract.config.json");
    console.log("config file path", pathToConfigFile);
    if (fs.existsSync(pathToConfigFile) == false) {
      console.log("config file not found,use args options");
      options = argvOptions;
      return options;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configOptions = JSON.parse(fs.readFileSync(pathToConfigFile, "utf-8"));

    console.log(`\nUsing config file found at ${pathToConfigFile}`);

    options = {
      ...configOptions,
      ...argvOptions,
    };
  } catch (error) {
    console.log("get config file error,use args options", error);
    options = argvOptions;
  }

  options.exclude = Array.isArray(options.exclude) ? options.exclude : [options.exclude];

  return options;
}
