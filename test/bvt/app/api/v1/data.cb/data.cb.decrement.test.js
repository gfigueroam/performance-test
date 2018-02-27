import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.cb.decrement.test.${seed.buildNumber}`;
const requestor = `data.admin.test.requestor.${seed.buildNumber}`;

describe('data.cb.decrement', () => {
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

  function decrement() {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
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

  it('prevents decrementing a key without an authorized service token', done => {
    const params = { key, requestor }; // Valid request
    const emptyToken = ''; // Missing token should fail
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;

    http.sendPostRequestError(paths.DATA_CB_DECREMENT, emptyToken, params, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_INCREMENT, tokens.serviceToken, {
      requestor,
    }, 'missing_arg', 'Required argument "key" missing.', done);
  });

  it('fails if the "requestor" parameter is not present with a serviceToken', done => {
    http.sendPostRequestError(paths.DATA_CB_INCREMENT, tokens.serviceToken, {
      key,
    }, errors.codes.ERROR_CODE_USER_NOT_FOUND, done);
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
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is a string', done => {
    store('string value')
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is an object', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        requestor,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });
});
