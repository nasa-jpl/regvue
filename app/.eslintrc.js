module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  plugins: ["@typescript-eslint", "vue", "html", "prettier"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
  ],
  rules: {
    "prettier/prettier": "error",
    "vue/multi-word-component-names": 0,
  },
};
