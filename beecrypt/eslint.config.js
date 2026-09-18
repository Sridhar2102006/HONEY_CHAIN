export default [
  {
    ignores: ["dist/**", "node_modules/**", "android/**", "ios/**", "firmware/**"]
  },
  {
    files: ["src/**/*.{js,jsx}", "server/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];
