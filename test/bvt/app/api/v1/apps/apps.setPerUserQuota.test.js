import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const quota = 1024;
const NEW_QUOTA = 2345;
const name = `uds.bvt.apps.setPerUserQuota.test.${seed.buildNumber}`;

const path = paths.APPS_SET_PER_USER_QUOTA;
const token = tokens.serviceToken;

const initialParams = { name, quota };
const newParams = { name, quota: NEW_QUOTA };
const OK = { ok: true };


describe('apps.setPerUserQuota', () => {
  after(done => {
    http.sendPostRequestSuccess(paths.APPS_REMOVE, token, { name }, OK, done);
  });

  it('should return error when there is no app with the given name', done => {
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, initialParams, errorCode, done);
  });

  [constants.HMH_APP, constants.CB_APP].forEach(reservedApp => {
    it(`should return error for reserved app named "${reservedApp}"`, done => {
      const params = { name: reservedApp, quota };
      const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('should update quota to a valid value', done => {
    seed.apps.addApp(initialParams).then(() => {
      http.sendPostRequestSuccess(path, token, newParams, OK, () => {
        const result = { ok: true, result: newParams };
        http.sendPostRequestSuccess(paths.APPS_INFO, token, { name }, result, done);
      });
    })
    .catch(done);
  });

  it('should return error when the request has a user token', done => {
    const userToken = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, initialParams, errorCode, done);
  });

  it('should fail to update quota if quota is too high', done => {
    const largeQuota = (1024 * 1024) + 1;
    const largeParams = { name, quota: largeQuota };
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;
    http.sendPostRequestError(path, token, largeParams, errorCode, () => {
      http.sendPostRequestSuccess(paths.APPS_INFO, token, { name }, {
        ok: true,
        result: newParams,
      },
      done);
    });
  });
});
