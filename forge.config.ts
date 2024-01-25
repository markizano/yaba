import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const csp = "default-src 'self' https://www.gstatic.com; " +
  "style-src 'self' 'unsafe-inline' data: https://www.gstatic.com https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: https://www.gstatic.com/; " +
  "img-src 'self' data: https://www.gstatic.com";

// https://stevenklambert.com/writing/comprehensive-guide-building-packaging-electron-app/

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './dist/index.html',
            js: './window/renderer.ts',
            name: 'main_window',
            preload: {
              js: './window/preload.ts',
            },
          },
        ],
      },
      port: 3001,
      devContentSecurityPolicy: csp,
      devServer: {
        historyApiFallback: {
          index: 'index.html'
        },
      },
    }),
  ],
};

export default config;
