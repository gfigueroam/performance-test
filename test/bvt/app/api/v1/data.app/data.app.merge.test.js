import sizeof from 'object-sizeof';

import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const app = `uds.bvt.data.app.merge.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.merge.test.${seed.buildNumber}`;
const requestor = 'data.requestor.test.requestor.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};
const quota = 1024;

const path = paths.DATA_APP_MERGE;
const token = tokens.serviceToken;

const OK = { ok: true };


const largeData = {
  string: 'hello',
};
while (sizeof(largeData) < quota) {
  largeData.string = `${largeData.string}-${largeData.string}`;
}
const halfQuotaData = {
  string: 'hello',
};
while (sizeof(halfQuotaData) < quota / 2) {
  // We want to be really close to half of the quota,
  //  so we don't double unlike the previous test.
  halfQuotaData.string += 'hello';
}


describe('data.app.merge', () => {
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
      app: '(invalid.app.name)',
      data,
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

  it('successfully stores when there is nothing previously stored', done => {
    const params = { app, data, key, requestor };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const getParams = { app, key, requestor };
      const result = {
        ok: true,
        result: {
          createdBy: requestor,
          data,
          key,
        },
      };
      http.sendPostRequestSuccess(paths.DATA_APP_GET, token, getParams, result, done);
    });
  });

  it('successfully merges a new key into the existing data', done => {
    const params = {
      app,
      data: {
        key4: {
          s: 'some string here',
        },
      },
      key,
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const getParams = { app, key, requestor };
      const result = {
        ok: true,
        result: {
          createdBy: requestor,
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              s: 'some string here',
            },
          },
          key,
          updatedBy: requestor,
        },
      };
      http.sendPostRequestSuccess(paths.DATA_APP_GET, token, getParams, result, done);
    });
  });

  it('successfully overwrites an existing key within existing data', done => {
    const params = {
      app,
      data: {
        key4: {
          b: true,
        },
      },
      key,
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const getParams = { app, key, requestor };
      const result = {
        ok: true,
        result: {
          createdBy: requestor,
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              b: true,
            },
          },
          key,
          updatedBy: requestor,
        },
      };
      http.sendPostRequestSuccess(paths.DATA_APP_GET, token, getParams, result, done);
    });
  });

  it('successfully overwrites an existing key and adds a new one within existing data', done => {
    const params = {
      app,
      data: {
        key4: {
          i: 7,
        },
        key5: 'whatever',
      },
      key,
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const getParams = { app, key, requestor };
      const result = {
        ok: true,
        result: {
          createdBy: requestor,
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              i: 7,
            },
            key5: 'whatever',
          },
          key,
          updatedBy: requestor,
        },
      };
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
    // consider the other fields to count against quota (eg, appKey, appRequestor, key, ...)
    // Those add just enough overhead that a second attempt to store will fail.
    const params = {
      app,
      data: halfQuotaData,
      key,
      requestor: `${requestor}.2`,
    };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      const errorCode = errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
      http.sendPostRequestError(path, token, params, errorCode, done);
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
