import common from 'hmh-bfm-nodejs-common';

import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const app = `uds.bvt.data.app.get.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.get.test.${seed.buildNumber}`;
const requestor = 'data.requestor.test.requestor.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

const path = paths.DATA_APP_GET;
const token = common.test.tokens.serviceToken;


describe('data.app.get', () => {
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
    await seed.app.remove({
      app,
      key,
      user: requestor,
    });

    await seed.apps.removeApps([app]);
  });

  it('throws invalid_app when the app contains invalid characters', done => {
    const params = {
      app: 'invalid app name',
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

  it('returns null when retrieving a non-existent key', done => {
    const params = {
      app,
      key: 'non.existent.key',
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, { ok: true }, done);
  });

  it('returns stored data when retrieving a previously set key', done => {
    const params = { app, key, requestor };
    const result = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });
});
