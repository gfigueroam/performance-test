import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const app = `uds.bvt.data.app.delete.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.delete.test.${seed.buildNumber}`;
const requestor = 'data.requestor.test.requestor.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

const path = paths.DATA_APP_DELETE;
const token = tokens.serviceToken;


describe('data.app.delete', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });

    await seed.app.add({
      app,
      data,
      key,
      user: requestor,
    });
  });

  after(async () => {
    await seed.apps.removeApps([app]);
  });

  it('throws invalid_app when the app contains invalid characters', done => {
    const params = {
      app: 'invalid-*-app-*-name',
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  [constants.HMH_APP].forEach(reservedApp => {
    it(`throws invalid_app when the app is the reserved app "${reservedApp}"`, done => {
      const params = {
        app: reservedApp,
        key,
        requestor,
      };
      const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('throws app_not_found when the app has not been registered in the system', done => {
    const params = {
      app: 'non.existent.app',
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('throws key_not_found when no data was previously stored at the key', done => {
    const params = {
      app,
      key: 'non.existent.key',
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_KEY_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('successfully deletes stored data', done => {
    const params = { app, key, requestor };
    http.sendPostRequestSuccess(path, token, params, { ok: true }, () => {
      http.sendPostRequestSuccess(paths.DATA_APP_GET, token, params, { ok: true }, done);
    });
  });
});
