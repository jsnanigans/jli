import {program} from 'commander';
import simpleGit from 'simple-git';
import chalk from 'chalk';

const execPath = process.cwd();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(`${execPath}/package.json`);

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
  .command('feat')
  .description('create a new feature branch')
  .requiredOption('-t, --ticket <ticket>', 'jira ticket number')
  .action(async (options) => {
    // check if git repo exists
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error('Not a git repository');
      return;
    }

    const ticket = options.ticket;
    const featurePrefix = packageJson?.jli?.featurePrefix;
    const baseBranch = packageJson?.jli?.baseBranch;

    if (!featurePrefix) {
      console.error('No feature prefix found in package.json, add jli.featurePrefix config');
      return;
    }

    if (!baseBranch) {
      console.error('No base branch found in package.json, add jli.baseBranch config');
      return;
    }

    const ticketName = `${featurePrefix}-${ticket}`;
    const featureBranchName = `feature/${ticketName}`;


    // check if branch exists
    const branches = await git.branch();
    const branchExists = branches.all.includes(featureBranchName);

    if (branchExists) {
      // switch to feature branch
      await git.checkout(featureBranchName);
      console.log(`Switched to feature branch ${chalk.green(featureBranchName)}`)
    } else {
      // checkout base branch and pull latest
      console.log(`Switching to base branch ${chalk.green(baseBranch)}`)
      await git.checkout(baseBranch);
      console.log(`Pulling latest from release branch ${chalk.green(baseBranch)}`)
      await git.pull();

      // create feature branch from release
      console.log(`Creating feature branch ${chalk.green(featureBranchName)} from ${chalk.green(baseBranch)}`)
      await git.checkoutLocalBranch(featureBranchName);
      console.log(`Created feature branch ${chalk.green(featureBranchName)}`)
    }
  });
