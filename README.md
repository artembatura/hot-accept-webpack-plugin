# hot-accept-webpack-plugin

Adds HMR accepting code to need modules. Based on [modify-source-webpack-plugin](https://github.com/artemirq/modify-source-webpack-plugin)

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
  plugins: [new HotAcceptPlugin(options)],
};
```

## Options

### `test`

Type: `string | RegExp | (string | RegExp)[]`

Default: `undefined`

`Required`

#### Example

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new HotAcceptPlugin({
      test: /index\.js/,
    }),
  ],
};
```
