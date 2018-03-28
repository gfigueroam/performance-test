import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import cb from '../../../../../common/helpers/cb';
import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.cb.get.test.${seed.buildNumber}`;
const requestor = 'data.admin.test.requestor.1';
const params = { key, requestor };

const path = paths.DATA_CB_GET;
const token = tokens.serviceToken;
const OK = { ok: true };


describe('data.cb.get', () => {
  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  after(done => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  it('fails if the "requestor" parameter is not present when using a service token', done => {
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, { key }, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, { requestor }, errorCode, errorDetails, done);
  });

  it('returns a stored boolean value', done => {
    store(true)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(true);
    }))
    .then(() => (store(false)))
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(false);
      done();
    }))
    .catch(done);
  });

  it('returns a stored int value', done => {
    store(15)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(15);
      done();
    }));
  });

  it('returns a stored float value', done => {
    store(6.789)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(6.789);
      done();
    }));
  });

  it('returns a stored string value', done => {
    store('this is a string used in a BVT')
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal('this is a string used in a BVT');
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
      expect(retrieved.result.data).to.deep.equal(obj);
      done();
    }));
  });

  it('returns an error when the key contains invalid chars', done => {
    const invalidParams = {
      key: 'invalid+key',
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_INVALID_KEY;
    http.sendPostRequestError(path, token, invalidParams, errorCode, done);
  });

  it('returns an error when owner does not match requestor', done => {
    const invalidParams = {
      key,
      owner: 'data.admin.test.owner.1',
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_AUTH_INVALID;
    http.sendPostRequestError(path, token, invalidParams, errorCode, done);
  });

  it('returns undefined when there is no existing value', done => {
    const invalidParams = {
      key: 'non.existent.bvt.key',
      requestor,
    };
    http.sendPostRequestSuccess(path, token, invalidParams, OK, done);
  });
});
