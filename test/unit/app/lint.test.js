import lint from 'mocha-eslint';

// Explicit test to run linter as part of test suite
const paths = [
  'app',
  'config',
  'test',
];

const options = {
  strict: true, // Fail test suite on any warnings or errors
};

lint(paths, options);