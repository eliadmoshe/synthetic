// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: 
  {
    ['synthetic']: "./src/index.js",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },

  // https://www.npmjs.com/package/webpack-node-externals
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder

  experiments: 
  {
    topLevelAwait: true,
  },


  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "index.html",
    // }),

    new NodePolyfillPlugin(),


    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (isProduction) 
  {
    config.mode = "production";

    // config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } 
  else 
  {
    config.mode = "development";
  }
  
  return config;
};
