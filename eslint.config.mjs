import vue from 'eslint-plugin-vue'
import vueTsConfig from '@vue/eslint-config-typescript'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'src-tauri/target/**',
      'src-tauri/gen/**',
      'node_modules/**',
      '.claude/**',
      '*.config.mjs',
      '*.config.js',
      '*.config.ts',
      '*.config.mts',
    ],
  },
  ...vue.configs['flat/recommended'],
  ...vueTsConfig(),
  prettier,
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/no-mutating-props': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
]
