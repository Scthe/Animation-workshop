const path = require('path');
const webpack = require('webpack');

const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
const ASSETS = path.resolve( __dirname, 'assets' );
const SHADERS = path.resolve( ROOT, 'shaders' );

module.exports = {
    context: ROOT,

    entry: {
        'main': './main.tsx'
    },

    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: [ ROOT, 'node_modules' ],
        alias: {
            assets: ASSETS,
            shaders: SHADERS,
            fa: '@fortawesome/free-solid-svg-icons',
            // typescript aliases are in tsconfig.json
        },
    },

    module: {
        rules: [
            // PRE-LOADERS
            { enforce: 'pre', test: /\.jsx?$/, use: 'source-map-loader' },
            { enforce: 'pre', test: /\.tsx?$/, use: 'tslint-loader', exclude: /node_modules/ },
            // LOADERS
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader', exclude: [ /node_modules/ ] },
            { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
            { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ },
            { test: /\.(gltf|bin|glb)$/, loader: 'file-loader', exclude: /node_modules/ },
            { test: /\.(png|jpg|gif)$/, use: 'url-loader?limit=15000&name=[name]-[hash].[ext]', exclude: /node_modules/ },
            { test: /\.scss$/, exclude: /node_modules/,
              // NOTE: we have to use 'typings-for-css-modules-loader' instead of
              //       'css-loader', cause typescript needs types to import
              //       when using css-modules.
              //         > import * as Styles from 'a.scss'
              //       would not work, cause typescipt needs info about 'a.scss'.
              loaders: [
                'style-loader', // creates style nodes from JS strings
                'typings-for-css-modules-loader?modules&namedExport', // translates CSS into CommonJS
                'sass-loader' // compiles Sass to CSS, using Node Sass by default
              ] }
        ],
    },

    devtool: 'cheap-module-source-map',
    devServer: {}
};
