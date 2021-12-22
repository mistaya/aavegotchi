module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    // ? '/aavegotchi/realm/'
    ? '/'
    : '/',
  chainWebpack: config => {
    // remove the prefetch plugin
    config.plugins.delete('prefetch')
  }
}
