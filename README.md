# babel-plugin-i18n-with-toml

Easily use i18n with toml


use i18n-js(https://github.com/fnando/i18n-js/tree/v3.9.2)

## Install

```sh
$ npm install babel-plugin-i18n-with-toml --save-dev
```

Add the `react-native-dotenv` preset to your **.babelrc** file at the project root.

```javascript
['i18n-with-toml', {
  moduleName: '@i18n', // module name
  configDir: './src/i18n' // i18n dir
  locale: 'en', // default locale
  fallbacks: true //you will be able to fill missing translations with those inside fallback, default value is true
}]
```

Directoryof i18n

```
`-- i18n
    |-- en
    |   |-- home.toml
    |   `-- login.toml
    `-- zh
        |-- home.toml
        `-- login.toml

3 directories, 4 files
```

## Usage


```js
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '@i18n';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start workin g on your app! {i18n.t('home.text')}.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


```
