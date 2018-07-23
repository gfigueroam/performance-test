import sizeof from 'object-sizeof';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';
import constants from '../../../../../../app/utils/constants';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';

const app = `uds.bvt.data.app.set.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.set.test.${seed.buildNumber}`;
const requestor = 'data.requestor.test.requestor.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
  key4: '',
};
const quota = 1024;

const path = paths.DATA_APP_SET;
const token = common.test.tokens.serviceToken;

const OK = { ok: true };


const halfQuotaData = {
  string: 'hello',
};
while (sizeof(halfQuotaData) < quota / 2) {
  // We want to be really close to half of the quota
  //  so we don't double unlike the previous test.
  halfQuotaData.string += 'hello';
}
const largeData = {
  string: 'hello',
};
while (sizeof(largeData) < quota) {
  largeData.string = `${largeData.string}-${largeData.string}`;
}

describe('data.app.set', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota,
    });
  });

  after(async () => {
    await seed.app.remove({
      app,
      key,
      user: requestor,
    });

    await seed.app.remove({
      app,
      key,
      user: `${requestor}.2`,
    });

    await seed.apps.removeApps([app]);
  });

  it('throws invalid_app when the app contains invalid characters', done => {
    const params = {
      app: '#fail invalid.app.name',
      data,
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  [constants.HMH_APP].forEach((reservedApp) => {
    it(`throws invalid_app when the app is the reserved app "${reservedApp}"`, done => {
      const params = {
        app: reservedApp,
        data,
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
      data,
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('throws an error when data is not JSON', done => {
    const params = {
      app,
      data: 'some invalid data',
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('successfully stores data with empty strings as null', done => {
    const params = { app, data, key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const result = {
        ok: true,
        result: {
          createdBy: requestor,
          data: {
            key1: true,
            key2: 'some string',
            key3: [1, 2, 3],
            key4: null,
          },
          key,
        },
      };
      const getParams = { app, key, requestor };
      http.sendPostRequestSuccess(paths.DATA_APP_GET, token, getParams, result, done);
    });
  });

  it('will not store data if the new data exceeds the quota by itself', done => {
    const params = {
      app,
      data: largeData,
      key,
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('will not store data if the new data plus previously stored data exceeds the quota', done => {
    // Since data is just less than half of the quota, we should be able to store it once.
    // A second store would theoretically take up less than the quota, except we
    // consider the other fields to count against quota
    // (eg, appKey, apprequestor, requestor, and key).
    // Those add just enough overhead that a second attempt to store will fail.
    const params = {
      app,
      data: halfQuotaData,
      key,
      requestor: `${requestor}.2`,
    };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const errorParams = {
        app,
        data: halfQuotaData,
        key: `${key}.2`,
        requestor: `${requestor}.2`,
      };
      const errorCode = errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
      http.sendPostRequestError(path, token, errorParams, errorCode, done);
    });
  });

  it('can remove the user quota from the app', done => {
    const p = paths.APPS_REMOVE_PER_USER_QUOTA;
    http.sendPostRequestSuccess(p, token, { name: app }, OK, done);
  });

  it('will store large data if the app quota has been removed', done => {
    const params = {
      app,
      data: largeData,
      key,
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });
});
