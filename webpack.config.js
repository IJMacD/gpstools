var webpack = require('webpack')

module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname,
        filename: "index.js"
    },
    plugins: [
      new webpack.ProvidePlugin({
        riot: 'riot'
      })
    ],
    module: {
        preLoaders: [
          {
            test: /\.tag$/,
            exclude: /node_modules/,
            loader: 'riotjs-loader',
            query: { type: 'none' }
          }
        ],
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel"
          }
        ]
    }
};
