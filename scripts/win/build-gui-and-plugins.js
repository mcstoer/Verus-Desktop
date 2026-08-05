const fs = require('fs');
const path = require('path');
const {
  GUI_DIR,
  LOGIN_CONSENT_CLIENT_DIR,
  LOGIN_CONSENT_CLIENT_PLUGIN_DIR,
  PBAAS_VISUALIZER_DIR,
  PBAAS_VISUALIZER_PLUGIN_DIR,
  findNode20,
  webpack4Env,
  rmDir,
  runSync,
} = require('./common');

function buildGui(node20) {
  console.log('\nBuilding Verus-Desktop-GUI...');
  // Windows friendly way of the same steps as `yarn build` in GUI.
  const buildDir = path.join(GUI_DIR, 'build');
  rmDir(buildDir);
  fs.mkdirSync(path.join(buildDir, 'assets'), {recursive: true});
  fs.cpSync(path.join(GUI_DIR, 'src', 'assets'), path.join(buildDir, 'assets'), {recursive: true});
  runSync(
    node20,
    [path.join('node_modules', 'webpack', 'bin', 'webpack.js'), '--mode', 'production'],
    {
      cwd: GUI_DIR,
      env: {...webpack4Env(node20), NODE_ENV: 'production'},
    }
  );
}

// Builds and installs the plugin from `pluginDir` into `sourceDir`.
function installPlugin(name, sourceDir, pluginDir, buildCommand) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  console.log(`\nBuilding ${name}...`);
  runSync(buildCommand.command, buildCommand.args, {
    cwd: sourceDir,
    env: buildCommand.env,
    shell: true,
  });

  console.log(`\nCopying the build of ${name}...`);
  rmDir(pluginDir);
  fs.mkdirSync(pluginDir, {recursive: true});
  fs.cpSync(path.join(sourceDir, 'build'), pluginDir, {recursive: true});
}

function buildAll() {
  const node20 = findNode20();

  buildGui(node20);

  installPlugin(
    'verus-login-consent-client',
    LOGIN_CONSENT_CLIENT_DIR,
    LOGIN_CONSENT_CLIENT_PLUGIN_DIR,
    {
      command: 'pnpm',
      args: ['build'],
    }
  );

  installPlugin('verus-pbaas-visualizer', PBAAS_VISUALIZER_DIR, PBAAS_VISUALIZER_PLUGIN_DIR, {
    command: 'yarn',
    args: ['build'],
    env: webpack4Env(node20),
  });
}

module.exports = {buildAll};

if (require.main === module) {
  buildAll();
}
