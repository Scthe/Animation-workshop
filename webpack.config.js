const path = require('path');
const webpack = require('webpack');

const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
const ASSETS = path.resolve( __dirname, 'assets' );
const SHADERS = path.resolve( ROOT, 'shaders' );

module.exports = {
    context: ROOT,

    entry: {
        'main': './main.ts'
    },

    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [ ROOT, 'node_modules' ],
        alias: {
            assets: ASSETS,
            shaders: SHADERS,
        },
    },

    module: {
        rules: [
            // PRE-LOADERS
            { enforce: 'pre', test: /\.js$/, use: 'source-map-loader' },
            { enforce: 'pre', test: /\.ts$/, use: 'tslint-loader', exclude: /node_modules/ },
            // LOADERS
            { test: /\.ts$/, use: 'awesome-typescript-loader', exclude: [ /node_modules/ ] },
            { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
            { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ },
            { test: /\.(gltf|bin|glb)$/, loader: 'file-loader', exclude: /node_modules/ }
        ]
    },

    devtool: 'cheap-module-source-map',
    devServer: {}
};