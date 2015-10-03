module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname,
        filename: "index.js"
    },
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
