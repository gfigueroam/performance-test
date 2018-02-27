import errors from '../../../../../../app/models/errors';
import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';
import constants from '../../../../../../app/utils/constants';

const name = `uds.bvt.apps.info.test.${seed.buildNumber}`;
const quota = 1024;

describe('apps.info', () => {
  after((done) => {
    const params = {
      name,
    };
    http.sendPostRequestSuccess(paths.APPS_REMOVE, tokens.serviceToken, params, {
      ok: true,
    }, done);
  });

  it('should return error when there is no app with the given name', done => {
    http.sendPostRequestError(paths.APPS_INFO, tokens.serviceToken, {
      name,
    }, errors.codes.ERROR_CODE_APP_NOT_FOUND, done);
  });

  [constants.CB_APP, constants.HMH_APP].forEach((reservedApp) => {
    it(`should return error when using app "${reservedApp}"`, done => {
      http.sendPostRequestError(paths.APPS_INFO, tokens.serviceToken, {
        name: reservedApp,
      }, errors.codes.ERROR_CODE_APP_NOT_FOUND, done);
    });
  });

  it('should return information about an existing app', done => {
    const params = {
      name,
      quota,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(paths.APPS_REGISTER, serviceToken, params, {
      ok: true,
    }, () => {
      http.sendPostRequestSuccess(paths.APPS_INFO, serviceToken, {
        name,
      }, {
        ok: true,
        result: params,
      }, done);
    });
  });
});
