module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  rules: {
    indent: ["error", 4],
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
}
