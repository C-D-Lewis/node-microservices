const path = require('path');

const appConfig = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            ['transform-react-jsx'],
          ],
        },
      },
    }],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

module.exports = [
  appConfig,
];