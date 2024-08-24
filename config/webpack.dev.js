const path = require("path")
const ESLintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const { DefinePlugin } = require("webpack")


const getCssLoader = pre => {
  return [
    "vue-style-loader", // 生成style标签并引入css注册到html中-处理vue中的style
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
    pre,
  ].filter(Boolean)
}
module.exports = {
  // 打包入口
  entry: "./src/main.js",
  output: {
    // 打包入口文件输出路径: 开发环境无需输出
    path: undefined,
    // hash：根据整个项目进行哈希，只要项目代码发生改变，输出文件哈希值就会发生改变。
    // contenthash：根据文件内容进行哈希，配合runtimeChunk防止修改项目任意位置代码重新打包后哈希值发生变化导致缓存失效。
    filename: "static/js/[name].[contenthash:8].js",
    // chunk代码分割文件输出路径
    chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    // 统一处理，无需单独配置：图片、字体等资源通过type: asset处理资源的命名方式（注意用hash）
    assetModuleFilename: "static/media/[name].[hash:10][ext]",
  },
  module: {
    rules: [
      // handle Css loader, postcss 处理兼容性问题，位置：css-loader后，预处理器loader前。
      // 还需搭配package.json中的browserslist进行兼容性适配
      {
        test: /\.css$/,
        use: getCssLoader(),
      },
      {
        test: /\.less$/,
        use: getCssLoader("less-loader"),
      },
      {
        test: /\.s[ac]ss$/,
        use: getCssLoader("sass-loader"),
      },
      {
        test: /\.styl$/,
        use: getCssLoader("stylus-loader"),
      },
      // handle img loader
      // 资源模块：是一种模块类型，它允许使用资源文件（字体，图标等）而无需配置额外 loader。
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset",
        parser: {
          // 将小于指定体积的图片转为base64，以减少http请求
          dataUrlCondition: {
            maxSize: 500 * 1024, // 500kb
          },
        },
      },
      // hanlde otherAsset loader
      {
        test: /\.(ttf|woff2?|map4|map3|avi)$/,
        // 原封不动输出到指定路径
        type: "asset/resource",
      },
      // handle js
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "../src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, // 开启babel编译缓存
          cacheCompression: false, // 缓存文件不要压缩
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录-不包含目录
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      // 开启缓存-设置缓存目录
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintCache"
      ),
    }),

    new HtmlWebpackPlugin({
      // 以 index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      // 注意这里的路径要和开发中的index.html路径保持一致。
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    // vue编译运行所需loader
    new VueLoaderPlugin(),
    // cross-env 定义的环境变量是给打包工具使用的
    // DefinePlugin定义的环境变量是给项目框架使用的，从而解决一些浏览器调试窗口警告。
    // 提供vue所需环境变量，解决浏览器调试窗口警告。
    new DefinePlugin({
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
    }),
  ],
  // 代码压缩/打包编译性能优化处理
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
      // 其他内容用默认配置即可
    },
    // 提取runtime文件：文件hash和文件的映射实现缓存
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`, // runtime文件命名规则
    },
  },
  // webpack解析模块加载
  resolve: {
    extensions: [".vue", ".js", ".json"], // 自动补全文件扩展名，让.vue可以使用
  },
  // 自动化
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    hot: true, // 开启热模块替换
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  // 更加友好的开发bug定位调试
  devtool: "cheap-module-source-map",
  // 开发环境
  mode: "development",
}
