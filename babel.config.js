const plugins = []
if (process.env.NODE_ENV === 'production') {
  plugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    // '@vue/cli-plugin-babel/preset',
    [
      '@vue/app',
      {
        useBuiltIns: 'entry'
      }
    ]
  ],
  plugins,
  'env': {
    'development': {
      // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
      // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
      'plugins': ['dynamic-import-node']
    }
  }
}
