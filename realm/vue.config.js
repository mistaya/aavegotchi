module.exports = {
  // eslint-disable-next-line no-undef
  publicPath: process.env.NODE_ENV === 'production'
    // ? '/aavegotchi/realm/'
    ? '/'
    : '/',
  chainWebpack: config => {
    // remove the prefetch plugin
    config.plugins.delete('prefetch')

    // don't halt the dev server for eslint errors
    config.plugin('eslint')
      .tap(args => {
        args[0].failOnError = false
        return args
      })
  }
}
