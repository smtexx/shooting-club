const path = require('path');
const ejs = require('ejs');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const htmlPluginConfig = require('./htmlPluginConfig');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = {
    mode: 'production',
    context: src,
    entry: src + '/index.js',
    output: {
        path: dist,
        filename: '[contenthash].js',
        clean: true
    },
    
    optimization: {
        splitChunks: {chunks: 'all'},
        minimize: true,
        minimizer: [
            `...`,
            new CssMinimizerPlugin({
                minify: CssMinimizerPlugin.cssoMinify
            })
        ]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.ejs$/,
                loader: 'html-loader',
                options: {
                    preprocessor: (content, loaderContext) => {
                        let result;

                        try {
                            result = ejs.render(content, null, {
                                filename: src + '/html/index.ejs' 
                            });
                        } catch (error) {
                            loaderContext.emitError(error);
                            return content;
                        }

                        return result;
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',  
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [[
                                    "postcss-preset-env",
                                    {
                                        stage: 0                                                       
                                    }
                                ]]
                            }
                        }
                    },                                      
                    'sass-loader'
                ]
            },
            {
                test: /\.(?:jpe?g|png|gif|svg|ico)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/img/[contenthash][ext]'
                }
            }, 
            {
                test: /\.(?:woff2?|ttf|iot)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[contenthash][ext]'
                }
            }  
        ]
    },

    plugins: htmlPluginConfig(src + '/html').concat([
        new MiniCssExtractPlugin({
            filename: '[contenthash].css'
        }),
        new ImageMinimizerPlugin({
            minimizerOptions: {
                plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 3 }],
                    ['svgo', {}]
                ]
            }
        })
    ])
};