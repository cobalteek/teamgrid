// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      "singleQuote": true,
      "semi": false,
      "tabWidth": 2,
      "useTabs": false,
      "trailingComma": "all"
    },
  },
)
