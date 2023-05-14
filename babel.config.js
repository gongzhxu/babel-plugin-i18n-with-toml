module.exports = {
  targets: {
    node: '7'
  },
  presets: ["babel-preset-expo"],
  plugins: [
    ['./dist', {
      configDir: './test/i18n'
    }]
  ]
}