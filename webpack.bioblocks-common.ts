import { default as CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as webpack from 'webpack';

// TODO: Use https://github.com/TypeStrong/typedoc and https://github.com/Microsoft/Typedoc-Webpack-Plugin
// tslint:disable-next-line:no-var-requires
// const TypedocWebpackPlugin = require('typedoc-webpack-plugin'); //

import * as path from 'path';

module.exports = {
  entry: {
    index: './index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'configs', 'tsconfig.webpack.json'),
            context: __dirname,
          },
        },
      },
      {
        // Needed for Plotly.js: https://github.com/plotly/plotly.js#building-plotlyjs-with-webpack
        loader: 'ify-loader',
        test: /\.js$/,
      },
      {
        include: [
          path.resolve(__dirname, 'node_modules/anatomogram'),
          path.resolve(__dirname, 'node_modules/bioblocks-viz'),
        ],
        test: /\.(woff(2)?|ttf|png|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
          {
            loader: `image-webpack-loader`,
            options: {
              query: {
                bypassOnDebug: true,
                gifsicle: {
                  interlaced: true,
                },
                mozjpeg: {
                  progressive: true,
                },
                optipng: {
                  optimizationLevel: 7,
                },
              },
            },
          },
        ],
      },
      {
        include: [
          path.resolve(__dirname, 'node_modules/anatomogram'),
          path.resolve(__dirname, 'node_modules/bioblocks-viz'),
        ],
        test: /\.(svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      automaticNameDelimiter: '~',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: 'all',
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      maxSize: 0,
      minChunks: 1,
      minSize: 30000,
      name: true,
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['index'],
      favicon: 'assets/favicons/favicon.ico',
      filename: 'index.html',
      inject: true,
      template: './index.html',
      title: 'Development',
    }),
    new CopyWebpackPlugin([
      {
        from: './assets',
        ignore: ['*.pdf'],
        to: './assets',
        toType: 'dir',
      },
    ]),
    new MiniCssExtractPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    alias: {
      ngl: path.resolve(__dirname, './node_modules/ngl/dist/ngl.js'),
      'plotly.js/lib/index-gl2d': path.resolve(__dirname, './node_modules/plotly.js/dist/plotly-gl2d.min.js'),
      '~contact-map-site~': path.resolve(__dirname, './src'),
      '~contact-map-site~/component': path.resolve(__dirname, './src/component'),
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, 'src'), path.join(__dirname, 'types'), path.resolve('node_modules'), 'node_modules'],
  },
};
