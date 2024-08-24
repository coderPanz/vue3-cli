const path = require("path")
const ESLintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin") // 生成html文件，并在script标签中引入打包后的项目入口文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin") // css单独打包
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin") // css压缩
const TerserWepackPlugin = require("terser-webpack-plugin") // js压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin") // img压缩
const CopyWebpackPlugin = require("copy-webpack-plugin") // 将指定目录下的资源复制到指定的打包输出目录
const { DefinePlugin } = require("webpack")
const { VueLoaderPlugin } = require("vue-loader")
// 需要通过 cross-env 定义环境变量
const isProduction = process.env.NODE_ENV === "production"
// element-plus按需引入
const AutoImport = require("unplugin-auto-import/webpack")
const Components = require("unplugin-vue-components/webpack")
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers")

const getCssLoader = pre => {
  return [
    // 开发模式下使用vue-style-loader后可开启vue中的css hmr
    isProduction ? MiniCssExtractPlugin.loader : "vue-style-loader", // 打包生成单独的css文件，而不是于js混合打包。
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
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
    // hash：根据整个项目进行哈希，只要项目代码发生改变，输出文件哈希值就会发生改变。
    // contenthash：根据文件内容进行哈希，配合runtimeChunk防止修改项目任意位置代码重新打包后哈希值发生变化导致缓存失效。
    filename: isProduction
      ? "static/js/[name].[contenthash:8].js"
      : "static/js/[name].js",
    // chunk代码分割文件输出路径
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:8].chunk.js"
      : "static/js/[name].chunk.js",
    // 统一处理，无需单独配置：图片、字体等资源通过type: asset处理资源的命名方式（注意用hash）
    assetModuleFilename: "static/media/[name].[hash:10][ext]",
    // 打包前先清空上次打包的内容
    clean: true,
  },
  module: {
    rules: [
      // webpack会对文件遍历所有的loader，即使loader匹配到对应文件。
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
        // 开启缓存-提升二次打包速度
        options: {
          cacheDirectory: path.resolve(__dirname, "../node_modules/.cache/vue-loader")
        }
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
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    //  CSS 提取到单独的文件中，并进行link导入防止闪屏
    isProduction &&
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].chunk.[contenthash:8].css",
      }),
    new CssMinimizerPlugin(),
    // 将public下面的资源复制到dist目录去（除了index.html）
    isProduction &&
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../src/assets"),
            to: path.resolve(__dirname, "../dist"),
            noErrorOnMissing: true, // 不生成错误
            globOptions: {
              // 忽略文件
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ].filter(Boolean),
  // 代码压缩/打包编译性能优化处理
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
      // 按文件类型分组打包
      cacheGroups: {
        // layouts通常是admin项目的主体布局组件，所有路由组件都要使用的
        // 可以单独打包，从而复用
        // 如果项目中没有，请删除
        layouts: {
          name: "layouts",
          test: path.resolve(__dirname, "../src/layouts"),
          priority: 40,
        },
        // 如果项目中使用element-plus，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
        // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好
        // 如果项目中没有，请删除
        elementUI: {
          name: "chunk-elementPlus",
          test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
          priority: 30,
        },
        // 将vue相关的库单独打包，减少node_modules的chunk体积。
        vue: {
          name: "vue",
          test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
          chunks: "initial",
          priority: 20,
        },
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10, // 权重最低，优先考虑前面内容
          chunks: "initial",
        },
      },
    },
    // 提取runtime文件：文件hash和文件的映射实现缓存
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`, // runtime文件命名规则
    },
    minimize: isProduction, // 为true才执行下面的minimizer
    minimizer: [
      // css压缩也可以写到optimization.minimizer里面，效果一样的
      new CssMinimizerPlugin(),
      // 当生产模式会默认开启TerserPlugin，如果需要进行额外配置，就要重新写了
      new TerserWepackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  // webpack解析模块加载
  resolve: {
    extensions: [".vue", ".js", ".json"], // 自动补全文件扩展名
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  // 更加友好的开发bug定位调试
  devtool: isProduction ? "source-map" : "cheap-module-source-map",
  // 生产环境：html自动压缩
  mode: isProduction ? "production" : "development",
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    hot: true, // 开启热模块替换
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  performance: false, // 关闭性能分析
}
