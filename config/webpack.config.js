var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Clean = require('clean-webpack-plugin');
require('es6-promise').polyfill();
var CopyWebpackPlugin = require('copy-webpack-plugin');
// BASE APP DIR
var root_dir = path.resolve(__dirname, '..');
var Config = require('./Config');

// FUNCTION TO EXTRACT CSS FOR PRODUCTION
function extractForProduction(loaders) {
  return ExtractTextPlugin.extract('style', loaders.substr(loaders.indexOf('!')));
}

module.exports = function (options) {
  // STYLE LOADERS
  var cssLoaders = 'style-loader!css-loader!postcss-loader',
    scssLoaders = 'style!css!postcss-loader!sass?outputStyle=expanded';

  // DIRECTORY CLEANER
  var cleanDirectories = ['build'];

  // OUTPUT PATH
  var outputPath = path.join(root_dir, 'assets');

  // GLOBAL VAR DEFINE
  var define = {
    APP_PACKAGE_VERSION: JSON.stringify(Config.APP_PACKAGE_VERSION),
    SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME: JSON.stringify(
      options.SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME
      || Config.SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME
    ),
    APP_VERSION: JSON.stringify(Config.APP_VERSION),
    __ELECTRON__: !!options.electron,
    CORE_ASSET: JSON.stringify(Config.CORE_ASSET),
    BLOCKCHAIN_URL: JSON.stringify(Config.BLOCKCHAIN_URLS),
    FAUCET_URL: JSON.stringify(Config.FAUCET_URLS),
    BITSHARES_WS: JSON.stringify(options.BITSHARES_WS || Config.BITSHARES_WS),
  };
  // COMMON PLUGINS
  var plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(define)
  ];

  if (options.prod) {
    // WRAP INTO CSS FILE
    cssLoaders = extractForProduction(cssLoaders);
    scssLoaders = extractForProduction(scssLoaders);

    // PROD PLUGINS
    plugins.push(new Clean(cleanDirectories, {
      root: root_dir
    }));
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }));

    plugins.push(new ExtractTextPlugin('app.css'));

    if (!options.noUgly) {
      plugins.push(new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        sourceMap: true,
        compress: {
          warnings: false
        },
        output: {
          screw_ie8: true
        }
      }));
    }

    // PROD OUTPUT PATH
    outputPath = path.join(root_dir, 'build');
  } else {

    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })),

    plugins.push(new webpack.HotModuleReplacementPlugin());

    if (options.ugly) {
      plugins.push(new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        sourceMap: true,
        compress: {
          warnings: false
        },
        output: {
          screw_ie8: true
        }
      }));
    }
  }

  var config = {
    entry: {
      app: options.prod ?
        path.resolve(root_dir, 'src/Main.js') : [
          'webpack-dev-server/client?http://localhost:8082',
          'webpack/hot/only-dev-server',
          path.resolve(root_dir, 'src/Main-dev.js')
        ]
    },
    output: {
      path: outputPath,
      filename: 'app.js',
      pathinfo: !options.prod,
      sourceMapFilename: '[name].js.map'
    },
    devtool: options.prod ? 'cheap-module-source-map' : 'source-map',
    debug: !options.prod,
    module: {
      noParse: /node_modules\/build/,
      loaders: [{
        test: /\.jsx$/,
        include: [
          path.join(root_dir, 'src'),
          path.join(root_dir, 'node_modules/react-foundation-apps'),
          '/home/sigve/Dev/graphene/react-foundation-apps'
        ],
        loaders: ['babel-loader']
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, path.resolve(root_dir, '../node_modules')],
        loader: 'babel-loader',
        query: {
          compact: false,
          cacheDirectory: true
        }
      },
      {
        test: /\.json/,
        loader: 'json',
        exclude: [
          path.resolve(root_dir, '../common'),
          path.resolve(root_dir, 'src/assets/locales')
        ]
      },
      {
        test: /\.coffee$/,
        loader: 'coffee-loader'
      },
      {
        test: /\.(coffee\.md|litcoffee)$/,
        loader: 'coffee-loader?literate'
      },
      {
        test: /\.css$/,
        loader: cssLoaders
      },
      {
        test: /\.scss$/,
        loader: scssLoaders
      },
      {
        test: /(\.png$)/,
        loader: 'url-loader?limit=100000',
        exclude: [
          path.resolve(root_dir, 'src/assets/asset-symbols'),
          path.resolve(root_dir, 'src/assets/images')
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          `image-webpack?${JSON.stringify({
            bypassOnDebug: true,
            optipng: {
              optimizationLevel: true
            },
            gifsicle: {
              interlaced: true
            }
          })}`
        ],
        exclude: [
          path.join(root_dir, 'src/assets/images')
        ]
      },
      {
        test: /\.woff$/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff'
      },
      {
        test: /.*\.svg$/,
        loaders: ['svg-inline-loader', 'svgo-loader'],
        exclude: [path.resolve(root_dir, 'src/assets/images/games/rps')]
      },
      {
        test: /\.md/,
        loader: 'html?removeAttributeQuotes=false!remarkable'
      },
      ],
      postcss: function () {
        return [precss, autoprefixer];
      }
    },
    resolve: {
      root: [path.resolve(root_dir, './src')],
      extensions: ['', '.js', '.jsx', '.coffee', '.json'],
      modulesDirectories: ['node_modules'],
      fallback: [path.resolve(root_dir, './node_modules')]
    },
    resolveLoader: {
      root: path.join(root_dir, 'node_modules'),
      fallback: [path.resolve(root_dir, './node_modules')]
    },
    plugins: plugins,
    root: outputPath,
    remarkable: {
      preset: 'full',
      typographer: true
    }
  };

  return config;
};
