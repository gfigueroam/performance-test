import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const app = `uds.bvt.data.app.list.app.${seed.buildNumber}`;
const key1 = `uds.bvt.data.app.list.test.1.${seed.buildNumber}`;
const key2 = `uds.bvt.data.app.list.test.2.${seed.buildNumber}`;
const requestor = `data.app.test.requestor.${seed.buildNumber}`;
const data = {};

const otherApp = `uds.bvt.data.app.list.other.app.${seed.buildNumber}`;
const otherUser = `data.app.test.other.requestor.${seed.buildNumber}`;

const path = paths.DATA_APP_LIST;
const token = tokens.serviceToken;


describe('data.app.list', () => {
  before(async () => {
    // Seed two different apps
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });
    await seed.apps.addApp({
      name: otherApp,
      quota: 1024,
    });

    // Seed two data items in an app for a user
    await seed.app.add({
      app,
      data,
      key: key1,
      user: requestor,
    });
    await seed.app.add({
      app,
      data,
      key: key2,
      user: requestor,
    });

    // Seed one data item in another app for other user
    await seed.app.add({
      app: otherApp,
      data,
      key: key1,
      user: otherUser,
    });
  });

  after(async () => {
    // Remove all data items
    await seed.app.remove({
      app,
      key: key1,
      user: requestor,
    });
    await seed.app.remove({
      app,
      key: key2,
      user: requestor,
    });
    await seed.app.remove({
      app: otherApp,
      key: key1,
      user: otherUser,
    });

    // Remove both apps from the system
    await seed.apps.removeApps([app, otherApp]);
  });

  it('returns app_not_found when the app is not registered', done => {
    const params = {
      app: 'non.existent.app',
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  [constants.HMH_APP].forEach(reservedApp => {
    it(`throws invalid_app when the app is the reserved app "${reservedApp}"`, done => {
      const params = {
        app: reservedApp,
        requestor,
      };
      const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('returns an empty list when no keys are set for a user', done => {
    const params = { app, requestor: otherUser };
    const result = {
      ok: true,
      result: {
        keys: [],
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('returns an empty list when no keys are set for a different user', done => {
    const params = { app: otherApp, requestor };
    const result = {
      ok: true,
      result: {
        keys: [],
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('returns a list of one key set for a user in an app', done => {
    const params = { app: otherApp, requestor: otherUser };
    const result = {
      ok: true,
      result: {
        keys: [key1],
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('returns a list of two keys set for a user in an app', done => {
    const params = { app, requestor };
    const result = {
      ok: true,
      result: {
        keys: [key1, key2],
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });
});
