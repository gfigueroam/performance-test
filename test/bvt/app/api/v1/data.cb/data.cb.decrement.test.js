import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.cb.decrement.test.${seed.buildNumber}`;
const user = `data.admin.test.user.${seed.buildNumber}`;

describe('data.cb.decrement', () => {
  function store(value) {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(paths.DATA_CB_SET, tokens.serviceToken, {
        data: value,
        key,
        user,
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
        user,
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
        user,
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
    const params = { key, user }; // Valid request
    const emptyToken = ''; // Missing token should fail
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;

    http.sendPostRequestError(paths.DATA_CB_DECREMENT, emptyToken, params, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_INCREMENT, tokens.serviceToken, {
      user,
    }, 'missing_arg', 'Required argument "key" missing.', done);
  });

  it('fails if the "user" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_INCREMENT, tokens.serviceToken, {
      key,
    }, 'missing_arg', 'Required argument "user" missing.', done);
  });

  it('decrements a non-existing value', done => {
    decrement()
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(-1);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(-2);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(-3);
    }))
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(-4);
      done();
    }));
  });

  it('decrements an existing value', done => {
    store(15)
    .then(decrement)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(14);
      done();
    }));
  });

  it('fails when the existing value is a boolean', done => {
    store(true)
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        user,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is a string', done => {
    store('string value')
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        user,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });

  it('fails when the existing value is an object', done => {
    store({})
    .then(() => {
      http.sendPostRequestError(paths.DATA_CB_DECREMENT, tokens.serviceToken, {
        key,
        user,
      }, errors.codes.ERROR_CODE_INVALID_DATA_TYPE, done);
    });
  });
});
