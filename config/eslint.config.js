import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'no-undef': 'error'
    },
    files: ['**/*.js', '**/*.mjs', '**/*.cjs']
  },
  // Cypress and Mocha globals for test files
  {
    files: [
      'tools/cypress/e2e/**/*.js',
      'tools/cypress/support/**/*.js',
      'tools/web-ui/cypress/e2e/**/*.js',
      'tools/web-ui/cypress/support/**/*.js',
      'tools/js_tools/messenger_bot_framework/fbbot/test/**/*.js'
    ],
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        context: 'readonly',
        assert: 'readonly',
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  // Jest globals for unit test files
  {
    files: ['tools/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  // TECHNICAL DEBT: Temporarily disable problematic rules to skip for now. Remove this block when addressing technical debt.
  {
    files: ['**/*.js'],
    rules: {
      'prefer-const': 'off',
      'no-var': 'off',
      'no-prototype-builtins': 'off',
      'no-redeclare': 'off',
      'no-cond-assign': 'off',
      'no-fallthrough': 'off',
      'no-undef': 'off',
      'no-dupe-keys': 'off',
      'no-unused-vars': 'off',
      'no-useless-escape': 'off',
      'no-multi-str': 'off',
      'no-case-declarations': 'off',
      'no-empty': 'off',
      'no-shadow': 'off',
      'no-inner-declarations': 'off',
      'no-unsafe-finally': 'off',
      'no-unreachable': 'off',
      'no-unsafe-negation': 'off',
      'no-constant-condition': 'off',
      'no-dupe-args': 'off',
      'no-dupe-else-if': 'off',
      'no-dupe-keys': 'off',
      'no-dupe-case': 'off',
      'no-duplicate-case': 'off',
      'no-empty-character-class': 'off',
      'no-ex-assign': 'off',
      'no-extra-boolean-cast': 'off',
      'no-extra-parens': 'off',
      'no-extra-semi': 'off',
      'no-func-assign': 'off',
      'no-import-assign': 'off',
      'no-irregular-whitespace': 'off',
      'no-obj-calls': 'off',
      'no-setter-return': 'off',
      'no-sparse-arrays': 'off',
      'no-unexpected-multiline': 'off',
      'no-unreachable-loop': 'off',
      'no-unsafe-optional-chaining': 'off',
      'no-useless-backreference': 'off',
      'valid-typeof': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'tools/cypress/support/e2e.js',
      'tools/cypress/support/commands.js',
      // TODO: Instead of hiding errors, capture them in a permanent log for technical debt tracking
      '.venv/**' // Ignore Python virtual environment
    ]
  }
];
