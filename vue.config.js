const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('sqlite')
      .test(/\.sqlite$/)
      .use('file-loader')
      .loader('file-loader')

    config.module
      .rule('wav')
      .test(/\.wav$/)
      .use('file-loader')
      .loader('file-loader')
  },
  pluginOptions: {
    electronBuilder: {
      // disableMainProcessTypescript: true,
      builderOptions: {
        'asar': false
      }
    }
  }
})
