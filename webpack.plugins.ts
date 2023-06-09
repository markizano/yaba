import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as webpack from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin");

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new MiniCssExtractPlugin({
    filename: 'assets/css/[name].css'
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new CopyPlugin({
    patterns: [
      {
        context: './src/assets/views/',
        from: '**.htm',
        to: './assets/views',
      }, {
        context: './src/assets/views/',
        from: '*/**.htm',
        to: './assets/views',
      }
    ]
  })
];
