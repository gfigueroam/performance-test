import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import cb from '../../../../../common/helpers/cb';
import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const expect = chai.expect;

const key = `uds.bvt.data.cb.decrement.test.${seed.buildNumber}`;
const requestor = `data.admin.test.requestor.${seed.buildNumber}`;
const params = { key, requestor };

const path = paths.DATA_CB_DECREMENT;
const token = common.test.tokens.serviceToken;
const OK = { ok: true };


describe('data.cb.decrement', () => {
  after(done => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  function decrement() {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(path, token, params, OK, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  it('prevents decrementing a key without an authorized service token', done => {
    const emptyToken = ''; // Missing token should fail
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, emptyToken, params, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, { requestor }, errorCode, errorDetails, done);
  });

  it('fails if the "requestor" parameter is not present with a serviceToken', done => {
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, { key }, errorCode, done);
  });

  it('decrements a non-existing value', done => {
    decrement()
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(-1);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(-2);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(-3);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(-4);
      done();
    }));
  });

  it('decrements an existing value', done => {
    store(15)
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(14);
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
