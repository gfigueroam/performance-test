import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.cb.get.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.cb.get', () => {
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

  it('fails if the "user" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_GET, tokens.serviceToken, {
      user,
    }, 'missing_arg', 'Required argument "key" missing.', done);
  });

  it('fails if the "key" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_GET, tokens.serviceToken, {
      key,
    }, 'missing_arg', 'Required argument "user" missing.', done);
  });

  it('returns a stored boolean value', done => {
    store(true)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(true);
    }))
    .then(() => (store(false)))
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(false);
      done();
    }))
    .catch(done);
  });

  it('returns a stored int value', done => {
    store(15)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(15);
      done();
    }));
  });

  it('returns a stored float value', done => {
    store(6.789)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal(6.789);
      done();
    }));
  });

  it('returns a stored string value', done => {
    store('this is a string used in a BVT')
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.equal('this is a string used in a BVT');
      done();
    }));
  });

  it('returns a stored object value', done => {
    const obj = {
      aBool: true,
      aHash: {
        key: 'value',
        key2: true,
        key3: 1,
        key4: ['hello', 'world'],
      },
      aList: [1, 2, 3],
      aString: 'some string',
    };

    store(obj)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result).to.deep.equal(obj);
      done();
    }));
  });

  it('returns an error when the key contains invalid chars', done => {
    new Promise((resolve, reject) => {
      http.sendPostRequest(paths.DATA_CB_GET, tokens.serviceToken, {
        key: 'invalid-key',
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
    }).then((response) => {
      expect(response).to.deep.equal({
        error: errors.codes.ERROR_CODE_INVALID_KEY,
        ok: false,
      });
      done();
    });
  });

  it('returns undefined when there is no existing value', done => {
    new Promise((resolve, reject) => {
      http.sendPostRequest(paths.DATA_CB_GET, tokens.serviceToken, {
        key: 'non.existent.bvt.key',
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
    })
    .then((response) => {
      expect(response).to.deep.equal({
        ok: true,
      });
      done();
    })
    .catch(done);
  });
});
