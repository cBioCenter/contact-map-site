import * as TerserPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';

// tslint:disable-next-line:no-relative-imports
import * as common from '../webpack.bioblocks-common';

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        minify: file => {
          // Webpack recently switched to using terser for its minimizer.
          // This introduced a weird bug with the contact map drawing faded points - needs further investigation.
          // For now, we're using uglify-js which previously worked just fine.
          // tslint:disable-next-line: no-require-imports no-unsafe-any
          return require('uglify-js').minify(file);
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
});
