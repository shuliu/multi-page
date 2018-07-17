const fs = require('fs');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var webpack = require("webpack");

let pages = [];
// 需要忽略的資料夾
let pageIgnore = ['try'];

// 搜尋目錄中檔案並 gen HtmlWebPackPlugin
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const extensionName = 'pug';

  templateFiles.forEach(item => {
    // Split names and extension
    const parts = item.split('.');
    const name = parts[0] || undefined;
    const extension = parts[1] || undefined;

    // 忽略沒檔名且第一個字為底線的
    let checkName = name !== undefined && name.substr(0, 1) !== '_';
    // 忽略 pageIgnore 內的資料夾及資料夾名第一次為底線的
    let checkDirectoryName = extension === undefined &&
      pageIgnore.indexOf(name) === -1 &&
      name.substr(0, 1) !== '_';

    if (checkDirectoryName) {
      var newTemplateDir = templateDir + '/' + name;
      generateHtmlPlugins(newTemplateDir);
    }

    // Create new HtmlWebPackPlugin with options
    if (name !== undefined && checkName && extension === extensionName) {
      pages.push(new HtmlWebPackPlugin({
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
      }));
    }
  });
  return pages;
}

// pug 全域變數
let globalJsonData = (require(path.resolve(__dirname, 'src/define.json')));

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins('./mockup') || [];

const pug = {
  test: /\.pug$/,
  use: ['html-loader?attrs=false', 'pug-html-loader?pretty']
};


let config = {
  entry: {
    app: './src/js/index.js'
  },
  output: {
    path: path.resolve(__dirname, ''),
    // filename: '[name].js',//'[name]-[chunkhash].js'
    publicPath: '/dist'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.pug$/,
        use: 'pug-loader?pretty=true&self=true',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'] // 處理 css
      }
      // {
      //   test: /\.(png|jpg|gif)$/,
      //   use: [{
      //     loader: 'url-loader',
      //     options: {
      //       outputPath: 'public/images/', // 輸出到 /public/images
      //       limit: 500 // 把小餘 500b 的檔案壓成 base64 格式寫入 js
      //     }
      //   }]
      // }
    ]
  },
  // resolve: {},
  devtool: 'inline-source-map',
  devServer: {
    // contentBase: './dist',
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), // 清除之前產生的文件
    new webpack.DefinePlugin(globalJsonData)
  ].concat(htmlPlugins)
};

module.exports = config;
