import { program } from "commander";
import simpleGit from "simple-git";
import chalk from "chalk";
import config from "../lib/checkConfig";
import highlightError from "../lib/highlightError";

const execPath = process.cwd();

/**
 * Command: feat
 *  > switches to feature branch if it exists
 *  > creates a new feature branch
 *  - pass option for jira ticket number, example: feat 1234
 */

const git = simpleGit({
  baseDir: execPath,
});

program
  .command("feat")
  .description("create a new feature branch")
  .requiredOption("-t, --ticket <ticket>", "jira ticket number")
  .action(async (options) => {
    // check if git repo exists
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error("Not a git repository");
      return;
    }

    const ticket = options.ticket;

    const featurePrefix = await config.featurePrefix();
    const baseBranch = await config.baseBranch();
    const branches = await git.branch();

    const ticketName = `${featurePrefix}-${ticket}`;
    const featureBranchName = `feature/${ticketName}`;

    // check if branch exists
    const branchExists = branches.all.includes(featureBranchName);

    if (branchExists) {
      // switch to feature branch
      try {
        console.log(`Switching to feature branch ${chalk.green(featureBranchName)}`);
        await git.checkout(featureBranchName);
      } catch (error) {
        console.error(highlightError(error.message));
        process.exit(1);
      }
    } else {
      try {
        // checkout base branch and pull latest
        console.log(`Switching to base branch ${chalk.green(baseBranch)}`);
        await git.checkout(baseBranch);
        console.log(
          `Pulling latest from release branch ${chalk.green(baseBranch)}`
        );
        await git.pull();

        // create feature branch from release
        console.log(
          `Creating feature branch ${chalk.green(
            featureBranchName
          )} from ${chalk.green(baseBranch)}`
        );
        await git.checkoutLocalBranch(featureBranchName);
        console.log(`Created feature branch ${chalk.green(featureBranchName)}`);
      } catch (error) {
        console.error(highlightError(error.message));
        process.exit(1);
      }
    }
  });
