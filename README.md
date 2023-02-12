[![npm version](https://img.shields.io/npm/v/hot-accept-webpack-plugin.svg)](https://www.npmjs.com/package/hot-accept-webpack-plugin)
![npm version](https://img.shields.io/npm/dm/hot-accept-webpack-plugin.svg)
![npm version](https://img.shields.io/npm/dt/hot-accept-webpack-plugin.svg)
![npm version](https://img.shields.io/snyk/vulnerabilities/npm/hot-accept-webpack-plugin.svg)
![npm version](https://img.shields.io/librariesio/release/npm/hot-accept-webpack-plugin.svg)
[![npm version](https://img.shields.io/npm/l/hot-accept-webpack-plugin.svg)](https://github.com/artembatura/hot-accept-webpack-plugin)

# [hot-accept-webpack-plugin](https://www.npmjs.com/package/hot-accept-webpack-plugin)

Simple webpack plugin to add HMR accepting code to need modules.

## Compatibility

| Webpack Version | Plugin version | Status                   |
| --------------- | -------------- | ------------------------ |
| ^5.0.0          | ^4.0.0         | <p align="center">✅</p> |
| ^4.37.0         | ^4.0.0         | <p align="center">✅</p> |

## Installation

### NPM

```
npm i -D hot-accept-webpack-plugin
```

### Yarn

```
yarn add -D hot-accept-webpack-plugin
```

## Import

### ES6/TypeScript

```js
import { HotAcceptPlugin } from 'hot-accept-webpack-plugin';
```

### CJS

```js
const { HotAcceptPlugin } = require('hot-accept-webpack-plugin');
```

## Usage

**webpack.config.js**

```js
module.exports = {
  plugins: [new HotAcceptPlugin(options)]
};
```

## Options

### `test`

Type: `string | RegExp | (string | RegExp)[]`

`Required`

#### Example (with RegExp)

In this example plugin will add `module.hot.accept` to all modules with filename `index.js`.

**webpack.config.js**

```js
const { HotModuleReplacementPlugin } = require('webpack');
const { HotAcceptPlugin } = require('hot-accept-webpack-plugin');

module.exports = {
  plugins: [
    new HotModuleReplacementPlugin(),
    new HotAcceptPlugin({
      test: /index\.js$/
    })
  ]
};
```

If you want to add `module.hot.accept` only to one specific file, you need declare more precise path to file. You can check next example.

#### Example (specific file)

For example, we have the following file structure

```
src/index.js
src/components/TodoList.js
src/components/index.js
```

If we want to add `module.hot.accept` only to `src/index.js`, we should use following RegExp: `/src\/index\.js$/`.

**webpack.config.js**

```js
const { HotModuleReplacementPlugin } = require('webpack');
const { HotAcceptPlugin } = require('hot-accept-webpack-plugin');

module.exports = {
  plugins: [
    new HotModuleReplacementPlugin(),
    new HotAcceptPlugin({
      test: /src\/index\.js$/
    })
  ]
};
```

#### Example (with string)

**webpack.config.js**

```js
const { HotModuleReplacementPlugin } = require('webpack');
const { HotAcceptPlugin } = require('hot-accept-webpack-plugin');

module.exports = {
  plugins: [
    new HotModuleReplacementPlugin(),
    new HotAcceptPlugin({
      test: 'index.js'
    })
  ]
};
```

#### Example (with test as array)

**webpack.config.js**

```js
const { HotModuleReplacementPlugin } = require('webpack');
const { HotAcceptPlugin } = require('hot-accept-webpack-plugin');
module.exports = {
  plugins: [
    new HotModuleReplacementPlugin(),
    new HotAcceptPlugin({
      test: ['one-module.js', /two-module.js$/]
    })
  ]
};
```

This plugin is based on [modify-source-webpack-plugin](https://github.com/artembatura/modify-source-webpack-plugin).
