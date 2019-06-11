'use strict'

var { VueLoaderPlugin } = require('vue-loader');
var path = require('path');

module.exports = {
    mode: 'development',
    entry: [
        './assets/js/index.js'
    ],
    output: {
        path: path.resolve(__dirname, 'public/')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/i,
                use: ['vue-style-loader', 'style-loader', 'css-loader'],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            app: path.resolve(__dirname, 'assets/js/app/')
        }
    }
}
