const {buildAll} = require('./build-gui-and-plugins');
const {ROOT, runSync} = require('./common');

buildAll();

console.log('\nBuilding Verus-Desktop for Windows...');
runSync('pnpm', ['dist'], {cwd: ROOT, shell: true});
