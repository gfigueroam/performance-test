import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const key = `uds.bvt.cb.app.data.test.${seed.buildNumber}`;
const data = 10;
const requestor = 'cb.app.test.requestor.1';

const token = tokens.serviceToken;

const OK = { ok: true };


describe('cb.app', () => {
  it('initially has no data under cb app', done => {
    const path = paths.DATA_CB_GET;
    const params = { key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('creates some data using data.cb.set endpoint', done => {
    const path = paths.DATA_CB_SET;
    const params = { data, key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('returns the new data via data.cb endpoint', done => {
    const path = paths.DATA_CB_GET;
    const params = { key, requestor };
    const expectedResult = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
      },
    };
    http.sendPostRequestSuccess(path, token, params, expectedResult, done);
  });

  it('returns the new data via data.app endpoint', done => {
    const path = paths.DATA_APP_GET;
    const params = { app: 'cb', key, requestor };
    const expectedResult = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
      },
    };
    http.sendPostRequestSuccess(path, token, params, expectedResult, done);
  });

  it('queries for the new data via data.app endpoint', done => {
    const path = paths.DATA_APP_QUERY;
    const keyPrefix = 'uds.bvt.cb.app';
    const params = { app: 'cb', keyPrefix, requestor };
    const result = {
      ok: true,
      result: [{
        app: 'cb',
        createdBy: requestor,
        data,
        key,
      }],
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('queries for the new data via data.cb endpoint', done => {
    const path = paths.DATA_CB_QUERY;
    const keyPrefix = 'uds.bvt.cb.app';
    const params = { keyPrefix, requestor };
    const result = {
      ok: true,
      result: [{
        app: 'cb',
        createdBy: requestor,
        data,
        key,
      }],
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('queries for no data via data.cb endpoint with wrong prefix', done => {
    const path = paths.DATA_CB_QUERY;
    const keyPrefix = 'uds.bvt.cb.wrong';
    const params = { keyPrefix, requestor };
    const result = {
      ok: true,
      result: [],
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('throws an error merging data via data.app endpoint', done => {
    const path = paths.DATA_APP_MERGE;
    const error = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
    const mergeData = { key: 'not-mergeable-with-a-string' };
    const params = { app: 'cb', data: mergeData, key, requestor };
    http.sendPostRequestError(path, token, params, error, done);
  });

  it('increments the data value using cb.increment endpoint', done => {
    const path = paths.DATA_CB_INCREMENT;
    const params = { key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('retrieves the new data with updated user via data.app endpoint', done => {
    const path = paths.DATA_APP_GET;
    const params = { app: 'cb', key, requestor };
    const expectedResult = {
      ok: true,
      result: {
        createdBy: requestor,
        data: data + 1,
        key,
        updatedBy: requestor,
      },
    };
    http.sendPostRequestSuccess(path, token, params, expectedResult, done);
  });

  it('retrieves the new data with updated user via data.cb endpoint', done => {
    const path = paths.DATA_CB_GET;
    const params = { key, requestor };
    const expectedResult = {
      ok: true,
      result: {
        createdBy: requestor,
        data: data + 1,
        key,
        updatedBy: requestor,
      },
    };
    http.sendPostRequestSuccess(path, token, params, expectedResult, done);
  });

  it('unsets the data via data.app endpoint', done => {
    const path = paths.DATA_APP_DELETE;
    const params = { app: 'cb', key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('no longer finds the cb data via data.cb endpoint', done => {
    const path = paths.DATA_CB_GET;
    const params = { key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });
});
