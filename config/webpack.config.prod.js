var path = require('path');
var paths = require('./paths');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var Clean = require('clean-webpack-plugin');
require('es6-promise').polyfill();
var CopyWebpackPlugin = require('copy-webpack-plugin');
// BASE APP DIR
var root_dir = path.resolve(__dirname, '..');
var Config = require('./Config');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
var publicPath = paths.servedPath;

// FUNCTION TO EXTRACT CSS FOR PRODUCTION
function extractForProduction(loaders) {
  return ExtractTextPlugin.extract('style', loaders.substr(loaders.indexOf('!')));
}

// STYLE LOADERS
var cssLoaders = 'style-loader!css-loader!postcss-loader',
  scssLoaders = 'style!css!postcss-loader!sass?outputStyle=expanded';

// DIRECTORY CLEANER
var cleanDirectories = ['build'];

// OUTPUT PATH
var outputPath = path.join(root_dir, 'build');

// GLOBAL VAR DEFINE
var define = {
  APP_PACKAGE_VERSION: JSON.stringify(Config.APP_PACKAGE_VERSION),
  SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME: JSON.stringify(
    Config.SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME
  ),
  APP_VERSION: JSON.stringify(Config.APP_VERSION),
  __ELECTRON__: true,
  CORE_ASSET: JSON.stringify(Config.CORE_ASSET),
  BLOCKCHAIN_URL: JSON.stringify(Config.BLOCKCHAIN_URLS),
  FAUCET_URL: JSON.stringify(Config.FAUCET_URLS),
  BITSHARES_WS: JSON.stringify(Config.BITSHARES_WS),
};

// COMMON PLUGINS
var plugins = [
  new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin(define),
  new Clean(cleanDirectories, {
    root: root_dir
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new ExtractTextPlugin('app.css'),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    sourceMap: true,
    compress: {
      warnings: false
    },
    output: {
      screw_ie8: true
    }
  }),
  new ManifestPlugin({
    fileName: 'asset-manifest.json'
  })
];

// WRAP INTO CSS FILE
cssLoaders = extractForProduction(cssLoaders);
scssLoaders = extractForProduction(scssLoaders);

// PROD OUTPUT PATH
outputPath = path.join(root_dir, 'build');

module.exports = {
  bail: true,
  devtool: 'source-map',
  entry: {
    app: path.resolve(root_dir, 'src/Main.js')
  },
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: publicPath
  },
  debug: false,
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
      query: {
        name: 'static/media/[name].[hash:8].[ext]'
      },
      exclude: [
        path.resolve(root_dir, 'src/assets/asset-symbols'),
        path.resolve(root_dir, 'src/assets/images')
      ]
    },
    {
      test: /\.svg$/,
      loader: 'file',
      query: {
        name: 'static/media/[name].[hash:8].[ext]'
      }
    },
    {
      test: /\.(jpe?g|png|gif)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        {
          loader: 'image-webpack',
          options: {
            bypassOnDebug: true,
            optipng: {
              optimizationLevel: true
            },
            gifsicle: {
              interlaced: true
            }
          }
        }
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
