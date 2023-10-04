const execPath = process.cwd();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(`${execPath}/package.json`);

export default class CheckConfig {
  static get featurePrefix(): string {
    const featurePrefix = packageJson?.jli?.featurePrefix;
    if (!featurePrefix) {
      console.error(
        "No feature prefix found in package.json, add jli.featurePrefix config"
      );
      process.exit(1);
    }

    return featurePrefix;
  }

  static get baseBranch(): string {
    const baseBranch = packageJson?.jli?.baseBranch;

    if (!baseBranch) {
      console.error(
        "No base branch found in package.json, add jli.baseBranch config"
      );
      process.exit(1);
    }

    return baseBranch;
  }
}
