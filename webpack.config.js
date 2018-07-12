const fs = require('fs');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let pages = [];
// Our function that generates our html plugins
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));

  templateFiles.forEach(item => {
    // Split names and extension
    const parts = item.split('.');
    const name = parts[0] || undefined;
    const extension = parts[1] || undefined;

    if( extension === undefined ) {
      var newTemplateDir = templateDir + '/' + name;
      generateHtmlPlugins(newTemplateDir);
    }

    // Create new HtmlWebPackPlugin with options
    // else 
    if( name !== undefined && extension !== undefined ) {
      pages.push(new HtmlWebPackPlugin({
          filename: `${name}.html`,
          template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
        })
      );
    }
  });
  return pages;
}

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins('./mockup') || [];
console.log(htmlPlugins);
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
    rules: [
      {
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
  plugins: [
    new CleanWebpackPlugin(['dist']), // 清除之前產生的文件

    // new HtmlWebPackPlugin({
    //   template: 'mockup/index.pug',
    //   filename: 'index.html'
    // }),

    // new HtmlWebPackPlugin({
    //   template: 'mockup/home.pug',
    //   filename: 'home.html',
    //   // publicPath: 'dist'
    //   // chunks: ['my-main'] // 打包時只打包 main.js，可通過此方法實現多頁面開發
    // }),
    // new HtmlWebPackPlugin({
    //   template: 'mockup/Category/category-index.pug',
    //   filename: 'category-index.html'
    // }),
    // new HtmlWebPackPlugin({
    //   template: 'mockup/Category/category-main.pug',
    //   filename: 'category-main.html'
    // }),

    // new HtmlWebPackPlugin({
    //   chunks: ["common", "[name]"],
    //   filename: "[name].html",
    //   template: "!!html-webpack-plugin/lib/loader.js!./mockup/[name].pug",
    //   inject: "body",
    //   title: function(id) {
    //       return titles[id];
    //   } // or maybe a shorthand like title: titles?
    // })
  ].concat(htmlPlugins)
};

module.exports = config;