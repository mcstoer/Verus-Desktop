const fs = require('fs');
const path = require('path');
const {
  GUI_DIR,
  LOGIN_CONSENT_CLIENT_DIR,
  PBAAS_VISUALIZER_DIR,
  ROOT,
  findNode20,
  webpack4Env,
  killTree,
  run,
} = require('./common');

const children = [];
let cleanedUp = false;

function cleanup() {
  if (cleanedUp) {
    return;
  }
  cleanedUp = true;
  console.log('\nCleaning up processes...');
  for (const child of children) {
    killTree(child.pid);
  }
}

// Trap important signals so we can cleanup properly.
process.on('exit', cleanup);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));
process.on('SIGBREAK', () => process.exit(149));
process.on('SIGHUP', () => process.exit(129));

const node20 = findNode20();

function startWebpack4DevServer(name, cwd, stdio) {
  const child = run(
    node20,
    [
      path.join('node_modules', 'webpack-dev-server', 'bin', 'webpack-dev-server.js'),
      '--colors',
      '--no-info',
      '--mode',
      'development',
    ],
    {
      cwd,
      env: webpack4Env(node20),
      stdio,
    }
  );
  child.on('exit', code => {
    if (!cleanedUp) {
      console.error(
        `\n${name} exited on its own with code ${code}. The app will not load until it is restarted.`
      );
    }
  });
  children.push(child);
}

console.log('\nStarting Verus-Desktop-GUI...');
startWebpack4DevServer('Verus-Desktop-GUI', GUI_DIR, 'inherit');

if (fs.existsSync(LOGIN_CONSENT_CLIENT_DIR)) {
  console.log('\nStarting verus-login-consent-client...');
  children.push(run('pnpm', ['start'], {cwd: LOGIN_CONSENT_CLIENT_DIR, shell: true}));
}

if (fs.existsSync(PBAAS_VISUALIZER_DIR)) {
  console.log('\nStarting verus-pbaas-visualizer...');
  startWebpack4DevServer('verus-pbaas-visualizer', PBAAS_VISUALIZER_DIR, 'ignore');
}

console.log('\nStarting Verus-Desktop...');
const electron = run('pnpm', ['debug'], {cwd: ROOT, shell: true});
children.push(electron);
electron.on('exit', code => process.exit(code === null ? 1 : code));
