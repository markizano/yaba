import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as webpack from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin");

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new CopyPlugin({
    patterns: [
      {
        context: './dist/',
        from: './**',
        to: './',
      }
    ]
  })
];
