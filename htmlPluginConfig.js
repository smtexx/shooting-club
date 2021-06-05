const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// To generate htmlWebpackPlugin config 
function htmlPluginConfig(path) {
    return  fs.readdirSync(path)
                .filter(name => /\.ejs$/.test(name))
                .map(name => new HtmlWebpackPlugin({
                    filename: `${name.split('.')[0]}.html`,
                    template: path + `/${name}`
    }));  
}

module.exports = htmlPluginConfig;