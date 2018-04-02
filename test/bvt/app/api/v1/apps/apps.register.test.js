import common from 'hmh-bfm-nodejs-common';

import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';


const name1 = `uds.bvt.apps.register.test.${seed.buildNumber}.1`;
const name2 = `uds.bvt.apps.register.test.${seed.buildNumber}.2`;
const quota = 1024;

const OK = { ok: true };

const path = paths.APPS_REGISTER;
const token = common.test.tokens.serviceToken;


describe('apps.register', () => {
  after(async () => {
    await seed.apps.removeApps([name1, name2]);
  });

  it('should throw an error for an invalid quota', done => {
    const params = { name: name1, quota: 'abc' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('should return error when the request has a user token', done => {
    const params = { name: name2, quota };
    const userToken = common.test.tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('should successfully register an app', done => {
    const params = { name: name1, quota };
    http.sendPostRequestSuccess(path, token, params, OK, () => {
      // Make sure the app was stored correctly
      const result = {
        ok: true,
        result: { name: name1, quota },
      };
      http.sendPostRequestSuccess(paths.APPS_INFO, token, { name: name1 }, result, done);
    });
  });

  it('should reject registering an app with a quota over 1M', done => {
    const params = { name: name2, quota: (1024 * 1024) + 1 };
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('should allow registering an app with a quota at precisely 1MB', done => {
    const params = { name: name2, quota: 1024 * 1024 };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('should reject registering an app with a name which is already taken', done => {
    const params = { name: name1, quota };
    const errorCode = errors.codes.ERROR_CODE_NAME_IN_USE;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  [constants.HMH_APP, constants.CB_APP].forEach(reservedName => {
    it(`should reject registering an app with the reserved name "${reservedName}"`, done => {
      const params = { name: reservedName, quota };
      const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });
});
