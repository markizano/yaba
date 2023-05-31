import type { Configuration } from 'webpack';
import * as path from 'path';
import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/index.ts',
    yaba: './src/yaba.ts'
  },
  // Put your normal webpack config below here
  output: {
    filename: '[name].js',
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
