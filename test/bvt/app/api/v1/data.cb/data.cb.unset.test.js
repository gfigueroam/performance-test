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

const path = paths.DATA_CB_UNSET;
const token = common.test.tokens.serviceToken;
const OK = { ok: true };


describe('data.cb.unset', () => {
  const store = cb.store(token, key, requestor);
  const retrieve = cb.retrieve(token, params);

  function unset() {
    return new Promise((resolve, reject) => {
      http.sendPostRequestSuccess(paths.DATA_CB_UNSET, token, params, OK, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  it('fails if the "requestor" parameter is not present while using a service token', done => {
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, token, { key }, errorCode, done);
  });

  it('fails if the "key" parameter is not present', done => {
    const errorCode = errors.codes.ERROR_CODE_MISSING_ARG;
    const errorDetails = 'Required argument "key" missing.';
    http.sendPostRequestErrorDetails(path, token, { requestor }, errorCode, errorDetails, done);
  });

  it('unsets a boolean value', done => {
    store(true)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(true);
    }))
    .then(unset)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved).to.deep.equal(OK);
      done();
    }))
    .catch(done);
  });

  it('unsets an int value', done => {
    store(15)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(15);
    }))
    .then(unset)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved).to.deep.equal(OK);
      done();
    }))
    .catch(done);
  });

  it('unsets a float value', done => {
    store(6.789)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal(6.789);
    }))
    .then(unset)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved).to.deep.equal(OK);
      done();
    }))
    .catch(done);
  });

  it('unsets a string value', done => {
    store('this is a string used in a BVT')
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved.result.data).to.equal('this is a string used in a BVT');
    }))
    .then(unset)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved).to.deep.equal(OK);
      done();
    }))
    .catch(done);
  });

  it('unsets an object value', done => {
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
    }))
    .then(unset)
    .then(retrieve)
    .then((retrieved => {
      expect(retrieved).to.deep.equal(OK);
      done();
    }))
    .catch(done);
  });
});
