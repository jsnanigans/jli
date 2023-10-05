import chalk from "chalk";

/*
example:
error: Your local changes to the following files would be overwritten by checkout:
	app/fastlane/Fastfile
	app/ios/App/App.xcodeproj/project.pbxproj
Please commit your changes or stash them before you switch branches.
Aborting
*/

export default function highlightError(error) {
    const lines = error.split("\n");
    const highlightedLines = lines.map((line) => {
        if (line.includes("error")) {
            const title = line.split(": ")[0];
            const message = line.split(": ")[1];
            return `${chalk.red.bold(title)}: ${chalk.yellow(message)}`;
        }
        if (line.includes("warning")) {
            const title = line.split(": ")[0];
            const message = line.split(": ")[1];
            return `${chalk.yellow.bold(title)}: ${chalk.yellow(message)}`;
        }

        const hasPadding = line.trim().length !== line.length;
        const isSingleWordLine = line.split(" ").length === 1;

        if (isSingleWordLine && !hasPadding) {
            return chalk.red.bold(line);
        }

        return line;
    });
    return highlightedLines.join("\n");
}
