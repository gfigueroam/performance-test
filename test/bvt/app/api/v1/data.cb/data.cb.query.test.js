import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const keyPrefix = `uds.bvt.data.cb.query.test.${seed.buildNumber}`;
const key1 = `${keyPrefix}.key.1`;
const key2 = `${keyPrefix}.key.2`;
const key3 = `uds.bvt.data.cb.query.some.other.test.${seed.buildNumber}.value.3`;
const requestor = 'data.cb.query.test.requestor.1';

describe('data.cb.query', () => {
  after((done) => {
    seed.calculatedBehavior.unset({
      key: key1,
      user: requestor,
    }, () => {
      seed.calculatedBehavior.unset({
        key: key2,
        user: requestor,
      }, () => {
        seed.calculatedBehavior.unset({
          key: key3,
          user: requestor,
        }, done);
      });
    });
  });

  function store(key, value) {
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

  function retrieve(prefix) {
    return new Promise((resolve, reject) => {
      http.sendPostRequest(paths.DATA_CB_QUERY, tokens.serviceToken, {
        keyPrefix: prefix,
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

  it('fails if the request has no auth token', done => {
    const params = { keyPrefix, requestor };
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(paths.DATA_CB_QUERY, '', params, errorCode, done);
  });

  it('fails if the "keyPrefix" parameter is not present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_QUERY, tokens.serviceToken, {
      requestor,
    }, 'missing_arg', 'Required argument "keyPrefix" missing.', done);
  });

  it('fails if the "requestor" parameter is not present when using a service token', done => {
    http.sendPostRequestError(paths.DATA_CB_QUERY, tokens.serviceToken, {
      keyPrefix,
    }, errors.codes.ERROR_CODE_USER_NOT_FOUND, done);
  });

  it('fails if the "owner" parameter doesnt match "requestor" parameter', done => {
    const params = {
      keyPrefix,
      owner: 'someone-else',
      requestor,
    };
    http.sendPostRequestError(
      paths.DATA_CB_QUERY,
      tokens.serviceToken,
      params,
      errors.codes.ERROR_CODE_AUTH_INVALID,
      done,
    );
  });

  it('returns an empty list when no values match keyPrefix', done => {
    store(key1, true)
    .then(() => (store(key2, false)))
    .then(() => (store(key3, 100)))
    .then(() => (retrieve('empty.prefix')))
    .then((retrieved => {
      expect(retrieved.ok).to.equal(true);
      expect(retrieved.result).to.deep.equal([]);
      done();
    }))
    .catch(done);
  });

  it('returns a list of results that match keyPrefix', done => {
    store(key1, 'string')
    .then(() => (retrieve(keyPrefix)))
    .then((retrieved => {
      expect(retrieved.ok).to.equal(true);
      expect(retrieved.result).to.deep.equal([
        {
          data: 'string',
          key: key1,
          user: requestor,
        },
        {
          data: false,
          key: key2,
          user: requestor,
        },
      ]);
      done();
    }));
  });
});
