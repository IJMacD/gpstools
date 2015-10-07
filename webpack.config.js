var webpack = require('webpack')

module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname,
        filename: "index.js"
    },
    devtool: "source-map",
    module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel"
          }
        ]
    }
};
