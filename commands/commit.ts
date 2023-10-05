import { program } from "commander";
import fs from "fs";
import childProcess from "child_process";
import simpleGit from "simple-git";
import chalk from "chalk";
import config from "../lib/checkConfig";

const spawn = childProcess.spawn;

const execPath = process.cwd();

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
  .command("commit")
  .description(
    'commit with message, add ticket number if on feature branch: "[PREFIX-1234] commit message"'
  )
  .requiredOption("-m, --message <message>", "commit message")
  .action(async (options) => {
    // check if git repo exists
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error("Not a git repository");
      process.exit(1);
    }

    const prefix = await config.featurePrefix();
    const gitBaseDir = await git.revparse(["--show-toplevel"]);
    const { current = "" } = await git.status();

    // check if on feature branch
    const isFeatureBranch = current.includes(`feature/${prefix}`);

    const commitPrefix = isFeatureBranch ? `[${current?.split("/")[1]}]` : "";

    // check and clean message
    let message = options.message;
    // remove any [...] prefix
    message = message.replace(/^\[.*\]/, "");
    // remove quotes
    message = message.replace(/['"]+/g, "");
    // remove trailing spaces
    message = message.trim();
    // remove trailing period
    message = message.replace(/\.$/, "");
    // capitalize first letter
    message = message.charAt(0).toUpperCase() + message.slice(1);

    const fullMessage = `${commitPrefix} ${message}`.trim();

    const stagedFiles = await git.diff(["--cached", "--name-only"]);
    const filesList = stagedFiles.split("\n").filter(Boolean);

    if (filesList.length === 0) {
      console.error("No staged files to commit");
      process.exit(1);
    }

    const esLintBin = `${execPath}/node_modules/.bin/eslint`;

    // check if eslint bin file exists
    const eslintExists = fs.existsSync(esLintBin);

    // run eslint on all js, jsx, ts, tsx files in sync
    if (eslintExists) {
      const filesForLinter = filesList.filter((file) =>
        file.match(/\.(js|jsx|ts|tsx)$/)
      );

      console.log(`Running eslint on ${filesForLinter.length} files`);
      const results = await Promise.allSettled(
        filesForLinter.map(async (file) => {
          return new Promise((resolve, reject) => {
            let buffer = "";
            const child = spawn(esLintBin, ["--fix", `${gitBaseDir}/${file}`], {
              cwd: execPath,
            });

            child.stdout.on("data", (data) => {
              buffer += data;
            });

            child.stderr.on("data", (data) => {
              buffer += data;
            });

            child.on("close", (code) => {
              if (code === 0) {
                resolve(buffer);
              } else {
                reject(buffer);
              }
            });
          });
        })
      );

      const errors = results.filter((result) => result.status === "rejected");

      if (errors.length > 0) {
        console.log(`Lint errors found in ${errors.length} files`);
        for (const error of errors) {
          console.error((error as unknown as { reason: string }).reason);
        }
        process.exit(1);
      }
    }

    console.log(`Committing with message: "${chalk.green(fullMessage)}"`);
    await git.commit(fullMessage, ["--no-verify"]);
  });
