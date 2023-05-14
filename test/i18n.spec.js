import * as babel from '@babel/core'
import i18n from '@i18n'
import Plugin from '../src'

describe('i18n test', () => {
  it('i18n transform', () => {
    const t = babel.transform(
      `import i18n from '@i18n'
       export default i18n`,
      {
        presets: ["babel-preset-expo"],
        plugins: [
          [Plugin, {
            configDir: './test/i18n'
          }]
        ]
      }
    )
 })

  it('en home.text', () => {
    expect(i18n.t('home.text')).toBe('Home')
  })

  it('en login.text', () => {
    expect(i18n.t('login.text')).toBe('Login In')
  })

  it('zh home.text', () => {
    i18n.locale = 'zh'
    expect(i18n.t('home.text')).toBe('主页')
  })

  it('zh login.text', () => {
    expect(i18n.t('login.text')).toBe('登陆')
  })
})