const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
const ASSETS = path.resolve( __dirname, 'assets' );
const SHADERS = path.resolve( ROOT, 'shaders' );

const config = ({mode, isProd}) => ({
    mode,

    context: ROOT,

    entry: {
        'main': './main.tsx'
    },

    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },

    // webpack's default recommended entry point size is 244kb. This app is 246kb.
    performance: {
      maxEntrypointSize: 250 * 1024, // 250kb
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
              loaders: [
                (isProd
                  ? MiniCssExtractPlugin.loader // extracts to file
                  : 'style-loader' // creates <style> nodes from JS strings
                ),
                {
                  loader: 'css-loader', // translates CSS into CommonJS
                  options: {
                    modules: true,
                    namedExport: true,
                    localIdentName: isProd ? '[hash:base64:4]' : '[local]--[hash:base64:5]',
                  }
                },
                'sass-loader' // compiles Sass to CSS, using Node Sass by default
              ] }
        ],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': { // just in case, webpack4 changed this. (argv.mode is not very documented, so I don't trust docs for this)
          'NODE_ENV': JSON.stringify(mode),
          'DEBUG': !isProd,
        }
      }),
      new HtmlWebpackPlugin({ // create HTML file as part of webpack output. Also injects all chunks
        template: 'index.html',
        sourceMap: false,
      }),
    ],

});

const configProd = config => {
  // no need to gzip, as github pages has it's own rules
  config.optimization = {
   minimizer: [
     new TerserPlugin({ // uglify does not handle ES6. We need minifier as we also override CSS optimizer
       parallel: true,
     }),
     new OptimizeCSSAssetsPlugin({}),
   ],
 };

  config.plugins.unshift(
    new CleanWebpackPlugin([`${DESTINATION}/*`]), // remove files from dist/
    new MiniCssExtractPlugin({ // create separate .css file
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  );

  config.stats = { children: false }; // MiniCssExtractPlugin spam..

  return config;
};

const configDev = config => {
  config.devServer = {};
  config.devtool = 'cheap-module-source-map';
  return config;
};

module.exports = (env, argv) => {
  const mode = argv.mode;
  const opts = { mode, isProd: mode === 'production' };
  console.log('MODE:', JSON.stringify(opts));

  const cfg = config(opts);

  return opts.isProd
    ? configProd(cfg)
    : configDev(cfg);
}
