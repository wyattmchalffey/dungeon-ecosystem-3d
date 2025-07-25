const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './src/main.js',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      clean: true,
      publicPath: '/'
    },
    
    resolve: {
      extensions: ['.js', '.glsl', '.vert', '.frag', '.comp'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'assets'),
        '@tests': path.resolve(__dirname, 'tests'),
        '@tools': path.resolve(__dirname, 'tools')
      }
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        },
        {
          test: /\.(glsl|vert|frag|comp)$/,
          use: 'raw-loader'
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        },
        {
          test: /\.(obj|gltf|glb)$/i,
          type: 'asset/resource',  
          generator: {
            filename: 'models/[name].[hash][ext]'
          }
        },
        {
          test: /\.(ogg|mp3|wav)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'audio/[name].[hash][ext]'
          }
        },
        {
          test: /\.json$/i,
          type: 'asset/resource',
          generator: {
            filename: 'data/[name].[hash][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: 'body',
        minify: !isDevelopment
      }),
      
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'assets',
            to: 'assets',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      port: process.env.PORT || 3000,
      host: 'localhost',
      hot: true,
      open: true,
      compress: true,
      historyApiFallback: true,
      
      client: {
        logging: 'info',
        overlay: {
          errors: true,
          warnings: false
        }
      },
      
      devMiddleware: {
        stats: 'minimal'
      }
    },
    
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          math: {
            test: /[\\/]src[\\/]math[\\/]/,
            name: 'math',
            chunks: 'all',
            priority: 10
          },
          rendering: {
            test: /[\\/]src[\\/]rendering[\\/]/,
            name: 'rendering', 
            chunks: 'all',
            priority: 10
          },
          simulation: {
            test: /[\\/]src[\\/]simulation[\\/]/,
            name: 'simulation',
            chunks: 'all',
            priority: 10
          }
        }
      },
      
      runtimeChunk: 'single'
    },
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    performance: {
      hints: isDevelopment ? false : 'warning',
      maxEntrypointSize: 2000000, // 2MB
      maxAssetSize: 1000000 // 1MB
    },
    
    stats: {
      preset: 'minimal',
      moduleTrace: true,
      errorDetails: true
    }
  };
};