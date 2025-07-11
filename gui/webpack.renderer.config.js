const rules = require('./webpack.rules');

rules.push({
  test: /\.(css|scss)$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: function () {
            return [
              require('autoprefixer')
            ];
          }
        }
      }
    },
  ],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
