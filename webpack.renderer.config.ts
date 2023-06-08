import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(jpg|jpeg|png|gif|svg)$/,
  type: 'asset/resource'
});

rules.push({
  test: /\.(js)$/,
  type: 'asset/resource'
});

export const rendererConfig: Configuration = {
  entry: {
    'yaba': './src/yaba.ts'
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
