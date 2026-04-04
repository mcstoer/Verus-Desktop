# Verus Desktop

The Verus Multicoin Wallet and Ecosystem desktop application

## Prerequisites

### Required Software

1) [Node.js](https://nodejs.org/en/download/)
    - **Note:** Node.js 20.x is recommended. Node.js 22 and higher are **not supported**.
2) [Yarn](https://yarnpkg.com/getting-started/install)
3) [Git](https://git-scm.com/)
4) [Verus CLI](https://verus.io/wallet)
    - This is where the `verus` and `verusd` binaries are found.

### Cloning the Repository and Plugins

Clone the Verus Desktop repository and the GUI submodule:
```bash
git clone -b password-manager-dev --recursive https://github.com/mcstoer/Verus-Desktop
```

#### Plugins

The plugins should be cloned into the same directory level as the `Verus-Desktop` folder.

The [Verus Login Consent Client](https://github.com/mcstoer/verus-login-consent-client) plugin is needed to handle deeplinks, including login.
```bash
git clone -b password-manager https://github.com/mcstoer/verus-login-consent-client.git
```

The [Verus PBaaS visualizer](https://github.com/VerusCoin/verus-pbaas-visualizer) plugin provides PBaaS network Visualizations in 3d graphs.
```bash
git clone https://github.com/VerusCoin/verus-pbaas-visualizer.git
```

### Verus Desktop Setup

In the `Verus-Desktop/assets` folder, create the following folder depending on your operating system:

| Operating System | Path                        |
|------------------|-----------------------------|
| Linux            | `bin/linux64/verusd`|
| macOS            | `bin/osx/verusd`    |
| Windows          | `bin\win64\verusd`  |

Copy both [`verus` and `verusd` binaries](#required-software) into the newly created folder (e.g., `bin/linux64/verusd`).

#### Deeplinks

Deeplinks are required for the Verus Login Consent Client plugin. To enable them, you need to create a [build](#creating-builds) and launch the resulting AppImage, installer, or executable.

## Creating Builds

| Operating System | File Type  |
|------------------|------------|
| Linux            | `.AppImage`|
| macOS            | `.dmg`     |
| Windows          | `.exe`     |

Builds will be located in the `Verus-Desktop/dist` directory.

### Using Linux or macOS

On Linux or macOS, create a build for the respective operating system with:
```bash
yarn install:all
yarn dist:all
```

#### Building for Windows on Linux (UNTESTED)

To create a build from Linux for Windows, you will need a [Docker container](https://www.electron.build/multi-platform-build#to-build-app-for-windows-on-linux) and to run these commands in the container:
```bash
yarn install:all
yarn dist-win:all
```

### Using Windows or Manually Creating Builds

To manually build the components and package Verus Desktop, follow these steps.

Build all dependencies, including the GUI and any optional plugins, before packaging the application. See [Production Mode (With Building)](#production-mode-with-building) for how to do this. 

For building on Windows:
```shell
yarn dist-win
```

For manually building on Linux or macOS:
```shell
yarn dist
```

For more detailed information about the build process, see the original [electron-builder](https://www.electron.build) website.

## For Development and Pre-Production Testing

Verus Desktop can be run in a development or production mode. For the production mode, you will need to build the GUI and plugins.

**Important:** If you want to run the GUI and/or the PBaaS visualizer separately, they require the `NODE_OPTIONS=--openssl-legacy-provider` environment variable. However, this environment variable will cause an error when trying to run Verus Desktop in the same terminal, so make sure to use a **separate terminal** for the GUI and PBaaS visualizer. Ignore this note if you are just running the commands with the `:all` suffix.

### Development Mode (Without Building)

On Linux and macOS, run Verus Desktop with plugins in development mode using a single terminal with:
```bash
yarn install:all
yarn dev:all
```

On Windows, or to run each part separately, follow these steps.

#### GUI

Open a new terminal in the Verus Desktop directory:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
cd gui/Verus-Desktop-GUI/react/
yarn install
```

You can run the GUI in two ways.

1. Without plugins:
    ```bash
    yarn start
    ```

2. With plugins:
    ```bash
    yarn start-no-dashboard
    ```

#### Optional: PBaaS visualizer

Open a new terminal, navigate to the PBaaS visualizer directory:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
yarn install
yarn start
```

#### Optional: Login Consent Client 

Open a new terminal, navigate to the Login Consent Client directory:
```bash
yarn install
yarn start
```

#### Desktop

With the GUI and any optional plugins running, navigate to the Verus Desktop directory:
```bash
yarn install
yarn start devmode
```

#### Debugging

- If you see a blank white window after starting the desktop application, check if the GUI is running.
- If the GUI or PBaaS visualizer fails to start and you get this error:
    
    `Error: error:0308010C:digital envelope routines::unsupported`
    
    This indicates that the required environment variable is not set.
- If the GUI or PBaaS visualizer fails to start and you get this error:

    `Error: listen EADDRINUSE: address already in use :::9838`

    Then run the GUI with `yarn start-no-dashboard` to avoid dashboard conflicts.

- If you get a blank white window after trying to open the PBaaS visualizer, check if the PBaaS visualizer is running.
- If you get a smaller blank white window after using a deeplink, check if the Login Consent Client is running.

### Production Mode (With Building)

On Linux and macOS, run Verus Desktop with plugins using a single terminal with
```bash
yarn install:all
yarn start:all
```

On Windows, or to manually build the components and run Verus Desktop, follow these steps.

#### GUI

Open a new terminal in the Verus Desktop directory:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
cd gui/Verus-Desktop-GUI/react/
yarn install
yarn build
```

#### Optional: PBaaS visualizer

Open a new terminal, navigate to the PBaaS visualizer directory:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
yarn install
yarn build
```

After building, you will find the plugin files in the `/build` directory. Create the folder `assets/plugins/builtin/verus-pbaas-visualizer/` inside your Verus Desktop directory and copy the build files into it.

#### Optional: Login Consent Client 

Open a new terminal, navigate to the Login Consent Client directory:
```bash
yarn install
yarn build
```

After building, you will find the plugin files in the `/build` directory. Create the folder `assets/plugins/builtin/verus-login-consent-client/` inside your Verus Desktop directory and copy the build files into it.

#### Desktop

With the GUI and any optional plugins built, navigate to the Verus Desktop directory:
```bash
yarn install
yarn start
```

#### Debugging

- If you see a blank white window after starting the desktop application, the GUI needs to be built.
- If the GUI or PBaaS visualizer fails to build and you get this error:
    
    `Error: error:0308010C:digital envelope routines::unsupported`
    
    This indicates that the required environment variable is not set.
- If you get a blank white window after trying to open the PBaaS visualizer, the PBaaS visualizer needs to be built.
- If you get a smaller blank white window after using a deeplink, the Login Consent Client needs to be built.