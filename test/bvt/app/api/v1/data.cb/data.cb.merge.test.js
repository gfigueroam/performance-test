import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.cb.merge.test.${seed.buildNumber}`;
const requestor = `data.admin.test.requestor.${seed.buildNumber}`;

describe('data.cb.merge', () => {
  after((done) => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  function store(value) {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(paths.DATA_CB_SET, tokens.serviceToken, {
        data: value,
        key,
        requestor,
      }, { ok: true }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  function merge(data) {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data,
        key,
        requestor,
      }, { ok: true }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  function retrieve() {
    return new Promise((resolve, reject) => {
      http.sendPostRequest(paths.DATA_CB_GET, tokens.serviceToken, {
        key,
        requestor,
      }, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (!res.ok) {
          return reject(new Error(res.error));
        }
        return resolve(res.body);
      });
    });
  }

  it('fails if the "key" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_MERGE, tokens.serviceToken, {
      data: {},
      requestor,
    }, 'missing_arg', 'Required argument "key" missing.', done);
  });

  it('fails if the "requestor" parameter is not present while using a service token', done => {
    http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
      data: {},
      key,
    }, errors.codes.ERROR_CODE_USER_NOT_FOUND, done);
  });

  it('fails if the "data" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_MERGE, tokens.serviceToken, {
      key,
      requestor,
    }, 'missing_arg', 'Required argument "data" missing.', done);
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
      expect(retrieved.result).to.deep.equal(data);
    }))
    .then(() => {
      // Let's merge the same object into itself; this should have no changes.
      merge(data);
    })
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.deep.equal(data);
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
      return new Promise((resolve) => {
        setTimeout(resolve, DELAY);
      });
    })
    /* eslint-enable arrow-body-style */
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.deep.equal({
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
      return new Promise((resolve) => {
        setTimeout(resolve, DELAY);
      });
    })
    /* eslint-enable arrow-body-style */
    .then(retrieve)
    .then((retrieved) => {
      expect(retrieved.result).to.deep.equal({
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

  it('fails when the existing value is a boolean', done => {
    store(true)
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: {},
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is a string', done => {
    store('string value')
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: {},
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is a number', done => {
    store(4)
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: {},
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the new data is a number', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: 4,
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA, done);
    });
  });

  it('fails when the new data is a boolean', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: true,
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA, done);
    });
  });

  it('fails when the new data is a float', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: 12.45,
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA, done);
    });
  });

  it('fails when the new data is a string', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_MERGE, tokens.serviceToken, {
        data: 'some string that we are trying to merge',
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA, done);
    });
  });
});
