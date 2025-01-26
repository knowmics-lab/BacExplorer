const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('fs');
const path = require('path');
const { prePackage } = require('./hooks');

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'bacexplorer',
    extraResource: [
      "./snakemake",
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel', //Windows
      config: {},
    },
    {
      name: '@electron-forge/maker-zip', //macOS
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb', //Linux
      config: {},
    },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  // hooks: "require:hooks.js",
  // hooks: {
  //   prePackage: async (forgeConfig, options) => {
  //     console.log("Running beforePack hook");
  //     const copyFileOutsideOfElectronAsar = function (sourcePath, destPath) {

  //       if (fs.existsSync(sourcePath)) {
  //           const dir = path.dirname(destPath);
  //           if (!fs.existsSync(dir)) {
  //               fs.mkdirSync(dir, { recursive: true });
  //           }

  //           fs.copyFileSync(sourcePath, destPath);
  //           // console.log(`File copiato con successo da ${sourcePath} a ${destPath}`);
  //       }   
  //   };

  //   //destPath è la cartella resources, al di fuori di app.asar
  //   const sourcePath = path.join(__dirname, 'snakemake');
  //   const destPath = path.join(options.dir, 'resources', 'snakemake');

  //   copyFileOutsideOfElectronAsar(sourcePath, destPath);
  //   }

  // },
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
