import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import cb from '../../../../../common/helpers/cb';
import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const expect = chai.expect;

const key = `uds.bvt.data.cb.set.test.${seed.buildNumber}`;
const requestor = 'data.admin.test.requestor.1';
const params = { key, requestor };

const path = paths.DATA_CB_SET;
const token = common.test.tokens.serviceToken;


describe('data.cb.set', () => {
  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  after(done => {
    seed.calculatedBehavior.unset({
      key,
      user: requestor,
    }, done);
  });

  it('fails if the "data" parameter is not present', done => {
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "data" missing.';
    http.sendPostRequestErrorDetails(path, token, params, errorCode, errorDetails, done);
  });

  it('fails if the "data" parameter is undefined', done => {
    const invalidParams = { data: null, key, requestor };
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;
    http.sendPostRequestError(path, token, invalidParams, errorCode, done);
  });

  it('fails if the "requestor" parameter is not present while using a service token', done => {
    const invalidParams = { data: true, key };
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, invalidParams, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    const invalidParams = { data: true, requestor };
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, invalidParams, errorCode, errorDetails, done);
  });

  it('stores a boolean value', done => {
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

  it('stores a int value', done => {
    store(15)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(15);
      done();
    }));
  });

  it('stores a float value', done => {
    store(6.789)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(6.789);
      done();
    }));
  });

  it('stores a string value', done => {
    store('this is a string used in a BVT')
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal('this is a string used in a BVT');
      done();
    }));
  });

  it('stores an object value', done => {
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
});
