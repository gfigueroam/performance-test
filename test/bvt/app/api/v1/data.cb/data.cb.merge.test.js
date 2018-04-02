import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import cb from '../../../../../common/helpers/cb';
import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const expect = chai.expect;

const key = `uds.bvt.data.cb.merge.test.${seed.buildNumber}`;
const requestor = `data.admin.test.requestor.${seed.buildNumber}`;
const params = { key, requestor };

const path = paths.DATA_CB_MERGE;
const token = common.test.tokens.serviceToken;
const OK = { ok: true };


describe('data.cb.merge', () => {
  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  after(done => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  function merge(data) {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(path, token, {
        data,
        key,
        requestor,
      }, OK, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  it('fails if the "key" parameter is not present', done => {
    const invalidParams = { data: {}, requestor };
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, invalidParams, errorCode, errorDetails, done);
  });

  it('fails if the "requestor" parameter is not present while using a service token', done => {
    const invalidParams = { data: {}, key };
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, invalidParams, errorCode, done);
  });

  it('fails if the "data" parameter is not present', done => {
    const invalidParams = { key, requestor };
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "data" missing.';
    http.sendPostRequestErrorDetails(path, token, invalidParams, errorCode, errorDetails, done);
  });

  it('merges correctly when there is no pre-existing value', done => {
    const data = {
      aBoolean: true,
      aListOfBooleans: [true, true, false],
      aListOfNumbers: [1, 2, 3, 4],
      anObject: {
        key: 'value',
      },
      aNumber: 123,
      aString: 'some value',
    };

    merge(data)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.deep.equal(data);
    }))
    .then(() => {
      // Let's merge the same object into itself; this should have no changes.
      merge(data);
    })
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.deep.equal(data);
      done();
    }))
    .catch(done);
  });

  it('merges into an existing value', done => {
    const DELAY = 100;

    const data = {
      aBoolean: true,
      aListOfBooleans: [true, true, false],
      aListOfNumbers: [1, 2, 3, 4],
      anObject: {
        key: 'value',
      },
      aNumber: 123,
      aString: 'some value',
    };

    const allNewProperties = {
      anotherBoolean: false,
      anotherListOfBooleans: [false, false, true],
      anotherListOfNumbers: [1, 2, 3, 4, 5, 6, 7],
      anotherNumber: 456,
      anotherObject: {
        anotherKey: 'anotherValue',
      },
      anotherString: 'some other value',
    };

    store(data)
    .then(() => {
      merge(allNewProperties);
    })
    /* eslint-disable arrow-body-style */
    .then(() => {
      // Delay to allow propagation of merged change. This appears to be necessary
      // on the local DynamoDB even if ConsistentRead is set to true on retrieve
      // operations
      return new Promise(resolve => {
        setTimeout(resolve, DELAY);
      });
    })
    /* eslint-enable arrow-body-style */
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.deep.equal({
        aBoolean: true,
        aListOfBooleans: [true, true, false],
        aListOfNumbers: [1, 2, 3, 4],
        anObject: {
          key: 'value',
        },
        anotherBoolean: false,
        anotherListOfBooleans: [false, false, true],
        anotherListOfNumbers: [1, 2, 3, 4, 5, 6, 7],
        anotherNumber: 456,
        anotherObject: {
          anotherKey: 'anotherValue',
        },
        anotherString: 'some other value',
        aNumber: 123,
        aString: 'some value',
      });
    }))
    .then(() => {
      // Overwrite all of the original properties
      merge({
        aBoolean: false,
        aListOfBooleans: [true, false],
        aListOfNumbers: [4],
        anObject: {
          key: 'value2',
        },
        aNumber: 1234,
        aString: 'some value2',
      });
    })
    /* eslint-disable arrow-body-style */
    .then(() => {
      // Delay to allow propagation of merged change. This appears to be necessary
      // on the local DynamoDB even if ConsistentRead is set to true on retrieve
      // operations
      return new Promise(resolve => {
        setTimeout(resolve, DELAY);
      });
    })
    /* eslint-enable arrow-body-style */
    .then(retrieve)
    .then(retrieved => {
      expect(retrieved.result.data).to.deep.equal({
        aBoolean: false,
        aListOfBooleans: [true, false],
        aListOfNumbers: [4],
        anObject: {
          key: 'value2',
        },
        anotherBoolean: false,
        anotherListOfBooleans: [false, false, true],
        anotherListOfNumbers: [1, 2, 3, 4, 5, 6, 7],
        anotherNumber: 456,
        anotherObject: {
          anotherKey: 'anotherValue',
        },
        anotherString: 'some other value',
        aNumber: 1234,
        aString: 'some value2',
      });
      done();
    })
    .catch(done);
  });

  function testMergeError(initialValue, data, errorCode, done) {
    // Helper function to store some initial data value and then attempt
    //  to merge a new data value where the type does not match and fails
    store(initialValue)
    .then(() => {
      http.sendPostRequestError(path, token, {
        data,
        key,
        requestor,
      }, errorCode, done);
    });
  }

  function testMergeDataTypeError(initialValue, done) {
    // Try to merge an empty object into an existing non-object value
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
    testMergeError(initialValue, {}, errorCode, done);
  }

  it('fails when the existing value is a boolean', done => {
    testMergeDataTypeError(true, done);
  });

  it('fails when the existing value is a string', done => {
    testMergeDataTypeError('string value', done);
  });

  it('fails when the existing value is a number', done => {
    testMergeDataTypeError(4, done);
  });

  function testMergeDataError(data, done) {
    // Try to merge a non-object value into an existing object
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;
    testMergeError({}, data, errorCode, done);
  }

  it('fails when the new data is a number', done => {
    testMergeDataError(4, done);
  });

  it('fails when the new data is a boolean', done => {
    testMergeDataError(true, done);
  });

  it('fails when the new data is a float', done => {
    testMergeDataError(12.45, done);
  });

  it('fails when the new data is a string', done => {
    testMergeDataError('some string that we are trying to merge', done);
  });
});
