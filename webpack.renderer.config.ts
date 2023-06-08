import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

rules.push({
  test: /\.css$/,
  // use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  entry: {
    yaba: './src/yaba.ts',
    preload: './src/preload.ts'
  },
  output: {
    filename: '[name].js'
  },
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
