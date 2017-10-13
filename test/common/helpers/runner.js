import chai from 'chai';

const expect = chai.expect;

// Utility functions that can run during unit tests to execute
//  a KOA-style middleware function, either synchronously or
//  asynchronously, to assert the function runs and calls `next`

// Test function that checks that a next fn is called successfully
const syncRunMiddleware = (testFn, testCtx) => {
  let nextVar = false;
  const next = () => {
    nextVar = true;
  };

  testFn(testCtx, next);

  expect(nextVar).to.equal(true);
};

// Test function that checks that a next fn is called successfully
const asyncRunMiddleware = (testFn, testCtx, done) => {
  let nextVar = false;
  const next = () => {
    nextVar = true;
  };

  testFn(testCtx, next).then(() => {
    expect(nextVar).to.equal(true);
    done();
  });
};

export default {
  asyncRunMiddleware,
  syncRunMiddleware,
};
