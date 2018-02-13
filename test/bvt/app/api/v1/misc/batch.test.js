import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const token = tokens.serviceToken;
const userToken = tokens.userTokens.internal;

const authzName1 = `uds.bvt.authz.batch.1.test.${seed.buildNumber}`;
const authzParams1 = {
  name: authzName1,
  url: 'https://hmheng-uds.test.app/another',
};
const authzName2 = `uds.bvt.authz.batch.2.test.${seed.buildNumber}`;
const authzParams2 = {
  name: authzName2,
  url: 'https://hmheng-uds.test.app/another',
};

const appName = `uds.bvt.data.app.set.batch.app.${seed.buildNumber}`;
const appQuota = 1024;

const appKey1 = `uds.bvt.data.app.set.batch.1.test.${seed.buildNumber}`;
const appKey2 = `uds.bvt.data.app.set.batch.2.test.${seed.buildNumber}`;
const appKey3 = `uds.bvt.data.app.set.batch.3.test.${seed.buildNumber}`;
const appData1 = 'some.test.data.1';
const appData2 = 'some.test.data.2';
const appData3 = 'some.test.data.3';
const requestor = 'data.requestor.test.batch.requestor.1';


describe('uds.batch', () => {
  it('returns an error when token is missing', done => {
    const noToken = '';
    const params = { whatever: 'invalid' };
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;

    http.sendBatchRequestError(noToken, params, errorCode, done);
  });

  it('returns an overall error for invalid params', done => {
    const params = { whatever: 'invalid' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_ARG_NAME;
    const details = 'Unexpected argument "whatever".';

    http.sendBatchRequestErrorDetails(token, params, errorCode, details, done);
  });

  it('rejects request to register two authz methods without service token', done => {
    const params = {
      ops: [
        {
          args: authzParams1,
          method: 'authz.register',
        },
        {
          args: authzParams2,
          method: 'authz.register',
        },
      ],
    };
    const error = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    const result = {
      ok: true,
      result: [
        {
          error,
          ok: false,
        },
        {
          error,
          ok: false,
        },
      ],
    };

    http.sendBatchRequest(userToken, params, result, done);
  });

  it('registers two authz methods in a single request', done => {
    // Make a batch request that creates two settings in a single call
    const params = {
      ops: [
        {
          args: authzParams1,
          method: 'authz.register',
        },
        {
          args: authzParams2,
          method: 'authz.register',
        },
        {
          args: {
            name: appName,
            quota: appQuota,
          },
          method: 'apps.register',
        },
      ],
    };
    const result = {
      ok: true,
      result: [
        { ok: true },
        { ok: true },
        { ok: true },
      ],
    };

    http.sendBatchRequest(token, params, result, done);
  });

  it('should set multiple data items in a single request', done => {
    const params = {
      ops: [
        {
          args: {
            data: appData1,
            key: appKey1,
            requestor,
            type: 'text',
          },
          method: 'data.user.set',
        },
        {
          args: {
            data: appData2,
            key: appKey2,
            requestor,
            type: 'text',
          },
          method: 'data.user.set',
        },
        {
          args: {
            data: appData3,
            key: appKey3,
            requestor,
            type: 'invalid',
          },
          method: 'data.user.set',
        },
      ],
    };
    const error = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
    const result = {
      ok: true,
      result: [
        { ok: true },
        { ok: true },
        {
          error,
          ok: false,
        },
      ],
    };

    http.sendBatchRequest(token, params, result, done);
  });

  it('runs multiple queries in a single request', done => {
    const params = {
      ops: [
        {
          args: { name: authzName1 },
          method: 'authz.info',
        },
        {
          args: { name: authzName2 },
          method: 'authz.info',
        },
        {
          args: {
            key: appKey1,
            requestor,
          },
          method: 'data.user.get',
        },
        {
          args: {
            key: appKey2,
            requestor,
          },
          method: 'data.user.get',
        },
      ],
    };
    const result = {
      ok: true,
      result: [
        {
          ok: true,
          result: authzParams1,
        },
        {
          ok: true,
          result: authzParams2,
        },
        {
          ok: true,
          result: {
            data: appData1,
            key: appKey1,
            type: 'text',
          },
        },
        {
          ok: true,
          result: {
            data: appData2,
            key: appKey2,
            type: 'text',
          },
        },
      ],
    };

    http.sendBatchRequest(token, params, result, done);
  });

  it('removes two authz methods in a single request', done => {
    const params = {
      ops: [
        {
          args: { name: authzName1 },
          method: 'authz.remove',
        },
        {
          args: { name: authzName2 },
          method: 'authz.remove',
        },
        {
          args: { name: appName },
          method: 'apps.remove',
        },
      ],
    };
    const result = {
      ok: true,
      result: [
        { ok: true },
        { ok: true },
        { ok: true },
      ],
    };

    http.sendBatchRequest(token, params, result, done);
  });
});
