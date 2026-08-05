const fs = require('fs');
const {
  GUI_DIR,
  LOGIN_CONSENT_CLIENT_DIR,
  PBAAS_VISUALIZER_DIR,
  ROOT,
  capture,
  fail,
  findNode20,
  webpack4Env,
  runSync,
} = require('./common');

function assertYarn() {
  const version = capture('yarn', ['--version']);
  if (version === null) {
    fail("yarn is required to install the GUI's dependencies, but it is not on PATH.");
  }
}

const node20 = findNode20();
assertYarn();

console.log('\nInstalling dependencies for Verus-Desktop-GUI...');
runSync('yarn', ['install'], {cwd: GUI_DIR, env: webpack4Env(node20), shell: true});

if (fs.existsSync(LOGIN_CONSENT_CLIENT_DIR)) {
  console.log('\nInstalling dependencies for verus-login-consent-client...');
  runSync('pnpm', ['install'], {cwd: LOGIN_CONSENT_CLIENT_DIR, shell: true});
} else {
  console.log('\nSkipping verus-login-consent-client, it is not checked out next to this repo.');
}

if (fs.existsSync(PBAAS_VISUALIZER_DIR)) {
  console.log('\nInstalling dependencies for verus-pbaas-visualizer...');
  runSync('yarn', ['install'], {cwd: PBAAS_VISUALIZER_DIR, env: webpack4Env(node20), shell: true});
} else {
  console.log('\nSkipping verus-pbaas-visualizer, it is not checked out next to this repo.');
}

console.log('\nInstalling dependencies for Verus-Desktop...');
runSync('pnpm', ['install'], {cwd: ROOT, shell: true});
