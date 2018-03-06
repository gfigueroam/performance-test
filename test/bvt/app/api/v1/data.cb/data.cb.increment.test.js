import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import cb from '../../../../../common/helpers/cb';
import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.cb.increment.test.${seed.buildNumber}`;
const requestor = `data.admin.test.requestor.${seed.buildNumber}`;
const params = { key, requestor };

const path = paths.DATA_CB_INCREMENT;
const token = tokens.serviceToken;
const OK = { ok: true };


describe('data.cb.increment', () => {
  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  after(done => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  function increment() {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(path, token, params, OK, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  it('fails if the "key" parameter is not present', done => {
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, { requestor }, errorCode, errorDetails, done);
  });

  it('fails if the "requestor" parameter is not present while using a service token', done => {
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, { key }, errorCode, done);
  });

  it('increments a non-existing value', done => {
    increment()
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(1);
    }))
    .then(increment)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(2);
    }))
    .then(increment)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(3);
    }))
    .then(increment)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(4);
      done();
    }));
  });

  it('increments an existing value', done => {
    store(15)
    .then(increment)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(16);
      done();
    }));
  });

  it('fails when the existing value is a boolean', done => {
    store(true)
    .then(() => {
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('fails when the existing value is a string', done => {
    store('string value')
    .then(() => {
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('fails when the existing value is an object', done => {
    store({})
    .then(() => {
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });
});
