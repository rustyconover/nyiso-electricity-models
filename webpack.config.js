const path = require("path");
const nodeBuiltins = require("builtin-modules");

const lambdaConfig = {
    entry: {
        "bot": path.resolve(__dirname + "/src/bot/bot.ts"),
    },
    mode: "production",
    target: "node",
    externals: {
        ...nodeBuiltins,
    },
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
                    configFile: "tsconfig-webpack-node.json",
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
    },
    output: {
        path: path.resolve(__dirname, "lambda"),
        libraryTarget: "commonjs2",
    },
};


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
            seedrandom: require.resolve("seedrandom"),
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

module.exports = [lambdaConfig, browserConfig];