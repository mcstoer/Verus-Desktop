const {spawn, spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const GUI_DIR = path.join(ROOT, 'gui', 'Verus-Desktop-GUI', 'react');
const PLUGIN_DIR = path.join(ROOT, 'assets', 'plugins', 'builtin');
const LOGIN_CONSENT_CLIENT_DIR = path.join(ROOT, '..', 'verus-login-consent-client');
const LOGIN_CONSENT_CLIENT_PLUGIN_DIR = path.join(PLUGIN_DIR, 'verus-login-consent-client');
const PBAAS_VISUALIZER_DIR = path.join(ROOT, '..', 'verus-pbaas-visualizer');
const PBAAS_VISUALIZER_PLUGIN_DIR = path.join(PLUGIN_DIR, 'verus-pbaas-visualizer');

function escapeForShell(part) {
  const value = String(part);
  return /[\s"]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Passing an args array together with `shell: true` triggers Node's DEP0190, so we just concatenate them.
function spawnArgs(command, args, options) {
  return options.shell
    ? [[command, ...args].map(escapeForShell).join(' '), options]
    : [command, args, options];
}

// Runs a command and returns the stdout.
function capture(command, args) {
  const result = spawnSync(...spawnArgs(command, args, {encoding: 'utf8', shell: true}));
  return result.error || result.status !== 0 ? null : result.stdout || '';
}

function fail(...lines) {
  for (const line of lines) {
    console.error(line);
  }
  process.exit(1);
}

// Since nvm-windows' use command runs a symlink, we just find the first node 20 version and directly use it to run the
// GUI and pbaas visualizer.
function findNode20() {
  if (process.version.startsWith('v20.')) {
    return process.execPath;
  }

  const nvmRootOutput = capture('nvm', ['root']);
  if (nvmRootOutput === null) {
    fail(
      `Node 20 is required to build/run the GUI, but the active node is ${process.version} and nvm-windows is not on PATH.`
    );
  }

  const match = nvmRootOutput.match(/Current Root:\s*(.+)/i);
  if (!match) {
    fail(
      `Could not parse the nvm-windows version store out of \`nvm root\`:`,
      nvmRootOutput.trim()
    );
  }

  const nvmRoot = match[1].trim();
  const versions = fs.existsSync(nvmRoot)
    ? fs
        .readdirSync(nvmRoot)
        .filter(name => /^v20\.\d+\.\d+$/.test(name))
        .sort((a, b) => b.localeCompare(a, undefined, {numeric: true}))
    : [];

  for (const version of versions) {
    const exe = path.join(nvmRoot, version, 'node.exe');
    if (fs.existsSync(exe)) {
      return exe;
    }
  }

  fail(
    `Node 20 is required to build/run the GUI, but the active node is ${process.version} and no v20.x.x was found in ${nvmRoot}.`
  );
}

// webpack 4 needs the legacy OpenSSL provider and the Node 20 directory.
function webpack4Env(node20) {
  return {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' '),
    PATH: path.dirname(node20) + path.delimiter + process.env.PATH,
  };
}

function run(command, args = [], options = {}) {
  const opts = {stdio: 'inherit', ...options};
  const child = spawn(...spawnArgs(command, args, opts));
  child.on('error', error => fail(`Failed to run ${command}: ${error.message}`));
  return child;
}

function runSync(command, args = [], options = {}) {
  const opts = {stdio: 'inherit', ...options};
  const result = spawnSync(...spawnArgs(command, args, opts));
  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
  }
  if (result.signal) {
    fail(`${command} ${args.join(' ')} was terminated by ${result.signal}`);
  }
  if (result.status !== 0) {
    console.error(`${command} ${args.join(' ')} exited with code ${result.status}`);
    process.exit(result.status || 1);
  }
}

// Kills a process and all of its children.
function killTree(pid) {
  const result = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {stdio: 'ignore'});
  // 128 means the process is already gone.
  if (result.status !== 0 && result.status !== 128) {
    console.error(
      `Warning: could not kill process tree ${pid} (taskkill exited with ${result.status})`
    );
  }
}

// Wrapper for rmSync with recursive, force, and retries.
function rmDir(dir) {
  fs.rmSync(dir, {recursive: true, force: true, maxRetries: 5, retryDelay: 200});
}

module.exports = {
  ROOT,
  GUI_DIR,
  PLUGIN_DIR,
  LOGIN_CONSENT_CLIENT_DIR,
  LOGIN_CONSENT_CLIENT_PLUGIN_DIR,
  PBAAS_VISUALIZER_DIR,
  PBAAS_VISUALIZER_PLUGIN_DIR,
  capture,
  fail,
  findNode20,
  webpack4Env,
  killTree,
  rmDir,
  run,
  runSync,
};
