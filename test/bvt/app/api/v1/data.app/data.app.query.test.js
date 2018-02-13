import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const keyPrefix = `uds.bvt.data.app.query.test.${seed.buildNumber}`;
const key1 = `uds.bvt.data.app.query.some.other.test.${seed.buildNumber}.value.1`;
const key2 = `${keyPrefix}.key.2`;
const key3 = `${keyPrefix}.key.3`;
const app1 = `uds.bvt.data.app.query.app.${seed.buildNumber}.1`;
const app2 = `uds.bvt.data.app.query.app.${seed.buildNumber}.2`;
const requestor = 'data.app.query.test.requestor.1';

const path = paths.DATA_APP_QUERY;
const serviceToken = tokens.serviceToken;

describe('data.app.query', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app1,
      quota: 1024,
    });
    await seed.apps.addApp({
      name: app2,
      quota: 1024,
    });

    await seed.app.add({
      app: app1,
      data: { data: true },
      key: key1,
      user: requestor,
    });
    await seed.app.add({
      app: app1,
      data: { data: 'value' },
      key: key2,
      user: requestor,
    });
    await seed.app.add({
      app: app2,
      data: { data: 100 },
      key: key3,
      user: requestor,
    });
  });

  after(async () => {
    await seed.apps.removeApps([app1, app2]);

    await seed.app.remove({
      app: app1,
      key: key1,
      user: requestor,
    });
    await seed.app.remove({
      app: app1,
      key: key2,
      user: requestor,
    });
    await seed.app.remove({
      app: app2,
      key: key3,
      user: requestor,
    });
  });

  it('fails if the request has no auth token', done => {
    const params = { app: app1, keyPrefix, requestor };
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, '', params, errorCode, done);
  });

  it('fails if the "keyPrefix" parameter is not present', done => {
    const params = { app: app2, requestor };
    const errorCode = 'missing_arg';
    const errorDetails = 'Required argument "keyPrefix" missing.';
    http.sendPostRequestErrorDetails(path, serviceToken, params, errorCode, errorDetails, done);
  });

  it('fails if the "app" parameter is not present', done => {
    const params = { keyPrefix, requestor };
    const errorCode = 'missing_arg';
    const errorDetails = 'Required argument "app" missing.';
    http.sendPostRequestErrorDetails(path, serviceToken, params, errorCode, errorDetails, done);
  });

  it('fails if the "requestor" parameter is not present when using a service token', done => {
    const params = { app: app1, keyPrefix };
    const errorCode = 'missing_arg';
    const errorDetails = 'Required argument "requestor" missing.';
    http.sendPostRequestErrorDetails(path, serviceToken, params, errorCode, errorDetails, done);
  });

  it('fails if the "app" does not exist', done => {
    const params = { app: 'none', keyPrefix, requestor };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('returns an empty list when no values match keyPrefix', done => {
    const params = {
      app: app2,
      keyPrefix: 'uds.bvt.data.app.query.some.other.test.',
      requestor,
    };
    const result = { ok: true, result: [] };
    http.sendPostRequestSuccess(path, serviceToken, params, result, done);
  });

  it('returns a list of results that match keyPrefix and app', done => {
    const params = { app: app1, keyPrefix, requestor };
    const result = {
      ok: true,
      result: [
        {
          app: app1,
          data: { data: 'value' },
          key: key2,
          user: requestor,
        },
      ],
    };
    http.sendPostRequestSuccess(path, serviceToken, params, result, done);
  });

  it('returns a list of results that match keyPrefix and the other app', done => {
    const params = { app: app2, keyPrefix, requestor };
    const result = {
      ok: true,
      result: [
        {
          app: app2,
          data: { data: 100 },
          key: key3,
          user: requestor,
        },
      ],
    };
    http.sendPostRequestSuccess(path, serviceToken, params, result, done);
  });
});
