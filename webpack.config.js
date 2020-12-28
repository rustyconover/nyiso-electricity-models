const path = require("path");

const browserConfig = {
    entry: {
        "nyiso-electricity-models": path.resolve(__dirname, "src/index.ts"),
    },
    mode: "production",
    target: "web",
    module: {
        rules: [
            {
                test: /\.node$/,
                use: "node-loader",
            },
            {
                test: /.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig-webpack.json",
                    transpileOnly: true,
                },
            },
        ],
    },
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: true,
        splitChunks: false,
        minimize: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            querystring: require.resolve("querystring-es3"),
        }
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        library: "nyiso-electricity-models",
        libraryTarget: 'umd',
        umdNamedDefine: true,
        filename: "[name].js",
    },
};

module.exports = [browserConfig];