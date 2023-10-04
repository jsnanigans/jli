import {program} from 'commander';
import simpleGit from 'simple-git';
import chalk from 'chalk';

const execPath = process.cwd();
const packageJson = require(`${execPath}/package.json`);

/**
 * Command: commit
 * > run lint check and fix on staged files
 * > commit with message, add ticket number if on feature branch: "[PREFIX-1234] commit message"
 * commits and skips commit checks with -n flag
 */

const git = simpleGit({
  baseDir: execPath,
});

program
  .command('commit')
  .description('commit with message, add ticket number if on feature branch: "[PREFIX-1234] commit message"')
  .requiredOption('-m, --message <message>', 'commit message')
  .action(async (options) => {
    // check if git repo exists
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error('Not a git repository');
      return;
    }

    const prefix = packageJson?.jil?.featurePrefix;

    // check if on feature branch
    const {current = ''} = await git.status();
    const isFeatureBranch = current.includes(`feature/${prefix}`);


    const commitPrefix = isFeatureBranch ? `[${current?.split('/')[1]}]` : '';
    console.log(commitPrefix);

    // commit
    // await git.add('.');
    console.log(`Committing with message: ${chalk.green(options.message)}`)
    await git.commit(`${commitPrefix} ${options.message}`);
  });
