import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './window/index.ts',
  // Put your normal webpack config below here
  mode: process.env.NODE_ENV == 'production'? 'production': 'development',
  optimization: {
    concatenateModules: true,
    emitOnErrors: true,
  },
  module: {
    rules,
  },
  node: {
    __dirname: true,
    __filename: true
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
