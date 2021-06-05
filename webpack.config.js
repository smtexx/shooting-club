const path = require('path');
const ejs = require('ejs');
const htmlPluginConfig = require('./htmlPluginConfig');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = {
    mode: 'development',
    context: src,
    entry: src + '/index.js',
    output: {
        path: dist,
        filename: '[name].js'        
    },
    devtool: 'source-map',  

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
                    'style-loader',
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
                    filename: 'assets/img/[name][ext]'
                }
            }, 
            {
                test: /\.(?:woff2?|ttf|iot)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]'
                }
            }  
        ]
    },

    plugins: htmlPluginConfig(src + '/html')
};