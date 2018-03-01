import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const quota = 1024;
const name = `uds.bvt.apps.removePerUserQuota.test.${seed.buildNumber}`;

const path = paths.APPS_REMOVE_PER_USER_QUOTA;
const token = tokens.serviceToken;
const OK = { ok: true };


describe('apps.removePerUserQuota', () => {
  before(async () => {
    await seed.apps.addApp({ name, quota });
  });

  after(async () => {
    await seed.apps.removeApps([name]);
  });

  it('should return error when the request has a user token', done => {
    const userToken = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, { name }, errorCode, done);
  });

  it('should return error when there is no app with the given name', done => {
    const params = { name: 'wrong.app.name' };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  [constants.HMH_APP, constants.CB_APP].forEach((reservedApp) => {
    const errorCode = errors.codes.ERROR_CODE_INVALID_APP;
    it(`should return error for reserved app named "${reservedApp}"`, done => {
      http.sendPostRequestError(path, token, { name: reservedApp }, errorCode, done);
    });
  });

  it('should update app to remove quota', done => {
    http.sendPostRequestSuccess(path, token, { name }, OK, done);
  });

  it('should now show an unlimited quota for the app', done => {
    http.sendPostRequestSuccess(paths.APPS_INFO, token, { name }, {
      ok: true,
      result: {
        name,
        quota: constants.UDS_UNLIMITED_QUOTA,
      },
    }, done);
  });
});
