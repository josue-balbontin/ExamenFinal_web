module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'boundaries'],
  rules: {
    'boundaries/element-types': [
      2,
      {
        default: 'disallow',
        rules: [
          {
            from: 'pages',
            allow: ['components', 'utils', 'styles', 'types']
          },
          {
            from: 'components',
            allow: ['components', 'utils', 'styles', 'types']
          },
          {
            from: 'utils',
            allow: ['utils', 'types']
          }
        ]
      }
    ]
  },
  settings: {
    'boundaries/elements': [
      { type: 'pages', pattern: 'src/pages/*' },
      { type: 'components', pattern: 'src/components/*' },
      { type: 'utils', pattern: 'src/utils/*' },
      { type: 'styles', pattern: 'src/styles/*' },
      { type: 'types', pattern: 'src/types/*' }
    ]
  }
};
