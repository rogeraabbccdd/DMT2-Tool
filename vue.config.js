module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github'],
        productName: 'DMT2 Tool'
      }
    }
  }
}
