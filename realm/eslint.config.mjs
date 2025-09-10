import js from "@eslint/js";
import pluginVue from 'eslint-plugin-vue';
import globals from "globals";

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/strongly-recommended'],
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,vue}'],
    plugins: {
      vue: pluginVue
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.commonjs
      },
    },
    rules: {
      "no-unused-vars": ["error", {
        argsIgnorePattern: "^(props|e|newVal|oldVal|event|reject)$",
        caughtErrors: "none"
      }],
      "no-empty": ["warn", {
        allowEmptyCatch: true
      }],
      "vue/attribute-hyphenation": ["off"],
      "vue/html-self-closing": ["off"],
      "vue/max-attributes-per-line": ["off"],
      "vue/html-closing-bracket-spacing": ["off"]
    }
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', 'docs/**'],
  }
];