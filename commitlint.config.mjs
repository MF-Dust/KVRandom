export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(功能|修复|优化|项目|版本号|Agent):\s+(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'header-min-length': [2, 'always', 4],
    'header-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
  },
}
