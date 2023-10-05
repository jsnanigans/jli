import prompts from "prompts";
const execPath = process.cwd();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(`${execPath}/package.json`);

class CheckConfig {
  private lastFeaturePrefix = "";
  async featurePrefix() {
    const featurePrefix = packageJson?.jli?.featurePrefix;
    if (this.lastFeaturePrefix) {
      return this.lastFeaturePrefix;
    }

    if (!featurePrefix) {
      const promptResponse = await prompts({
        type: "text",
        name: "featurePrefix",
        message: "Enter feature prefix",
      });

      if (promptResponse.featurePrefix) {
        this.lastFeaturePrefix = promptResponse.featurePrefix;
        return promptResponse.featurePrefix;
      }
      console.error(
        "No feature prefix found in package.json, add jli.featurePrefix config"
      );
      process.exit(1);
    }

    this.lastFeaturePrefix = featurePrefix;
    return featurePrefix;
  }

  private lastBaseBranch = "";
  async baseBranch() {
    const baseBranch = packageJson?.jli?.baseBranch;
    if (this.lastBaseBranch) {
      return this.lastBaseBranch;
    }

    if (!baseBranch) {
      const promptResponse = await prompts({
        type: "text",
        name: "baseBranch",
        message: "Enter base branch",
      });

      if (promptResponse.baseBranch) {
        this.lastBaseBranch = promptResponse.baseBranch;
        return promptResponse.baseBranch;
      }
      console.error(
        "No base branch found in package.json, add jli.baseBranch config"
      );
      process.exit(1);
    }

    this.lastBaseBranch = baseBranch;
    return baseBranch;
  }
}

const checkConfig = new CheckConfig();
export default checkConfig;
