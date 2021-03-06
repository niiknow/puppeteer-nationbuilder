module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
    es6: true
  },
  extends: [ "eslint:recommended" ],
  parserOptions: {
    "sourceType": "module",
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "globalReturn": false,
      "impliedStrict": false,
      "jsx": false,
      "allowImportExportEverywhere": true
    }
  },
  rules: {
    // allow paren-less arrow functions
    "arrow-parens": 0,
    // allow async-await
    "generator-star-spacing": 0,
    // allow debugger during development
    "no-debugger": 0,
    "quotes": [2, "single"],
    "semi": [2, "always"]
  },
  overrides: [
    {
      files: [
        "tests/*.test.js"
      ],
      env: {
        jest: true // now **/*.test.js files' env has both es6 *and* jest
      },
      // Can't extend in overrides: https://github.com/eslint/eslint/issues/8813
      // "extends": ["plugin:jest/recommended"]
      plugins: ["jest"],
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error"
      }
    }
  ]
}
