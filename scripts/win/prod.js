const {ROOT, runSync} = require('./common');
const {buildAll} = require('./build-gui-and-plugins');

buildAll();

console.log('\nStarting Verus-Desktop...');
runSync('pnpm', ['start'], {cwd: ROOT, shell: true});
