import {program} from 'commander';

const execPath = process.cwd();
// find closets package.json

let packageJson;
try {
  packageJson = require(`${execPath}/package.json`);
}
catch (e) {
  console.error('No package.json found');
}

import './commands/feat';
import './commands/commit';

program.parse(process.argv);
