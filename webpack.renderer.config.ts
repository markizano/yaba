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
  entry: './dist/index.ts',
  module: {
    rules,
  },
  plugins,
  optimization: {
    concatenateModules: true
  },
  devServer: {
    port: 4200,
    historyApiFallback: {
      index: 'index.html'
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
