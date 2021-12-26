module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    // ? '/aavegotchi/realm/'
    ? '/'
    : '/',
  chainWebpack: config => {
    // remove the prefetch plugin
    config.plugins.delete('prefetch')
    // Override default json loader for asset files,
    // so we can fetch json files at runtime instead of bundling them
    // https://stackoverflow.com/questions/50686102/webpack-es6-load-json-with-dynamic-import-preserve-json-file
    // https://cli.vuejs.org/guide/webpack.html#chaining-advanced
    config.module
      .rule('file-json')
      .test(/asset.*\.json$/)
      // This needs to report a non-json output type to stop the json-loader running
      .type('javascript/auto')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name]-[hash].[ext]'
      })
      .end()
  }
}
