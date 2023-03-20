module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    project: ["tsconfig.json"],
    sourceType: 'module'
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "no-useless-catch": "off"
    // "@typescript-eslint/no-non-null-assertion": "off"
  }
}
