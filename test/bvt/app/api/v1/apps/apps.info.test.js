import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const name = `uds.bvt.apps.info.test.${seed.buildNumber}`;
const quota = 1024;

const OK = { ok: true };

const path = paths.APPS_INFO;
const token = tokens.serviceToken;


describe('apps.info', () => {
  after(done => {
    http.sendPostRequestSuccess(paths.APPS_REMOVE, token, { name }, OK, done);
  });

  it('should return error when the name is invalid', done => {
    const errorCode = errors.codes.ERROR_CODE_INVALID_NAME;
    http.sendPostRequestError(path, token, { name: '' }, errorCode, done);
  });

  it('should return error when there is no app with the given name', done => {
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
    http.sendPostRequestError(path, token, { name }, errorCode, done);
  });

  [constants.CB_APP, constants.HMH_APP].forEach(reservedApp => {
    it(`should return error when using app "${reservedApp}"`, done => {
      const params = { name: reservedApp };
      const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('should return information about an existing app', done => {
    const params = { name, quota };
    http.sendPostRequestSuccess(paths.APPS_REGISTER, token, params, { ok: true }, () => {
      const result = {
        ok: true,
        result: params,
      };
      http.sendPostRequestSuccess(path, token, { name }, result, done);
    });
  });
});
