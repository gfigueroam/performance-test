import common from 'hmh-bfm-nodejs-common';

import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';


const name = `uds.bvt.apps.remove.test.${seed.buildNumber}`;
const quota = 1024;

const path = paths.APPS_REMOVE;
const token = common.test.tokens.serviceToken;

const OK = { ok: true };


describe('apps.remove', () => {
  before(async () => {
    await seed.apps.addApp({ name, quota });
  });

  it('should return an error when the app name is invalid', done => {
    const params = { name: '*not_valid*.fail#' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_NAME;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('should silently do nothing when an app does not exist', done => {
    http.sendPostRequestSuccess(path, token, { name: 'nope' }, OK, done);
  });

  it('should return an error when a user token is found', done => {
    const userToken = common.test.tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, { name }, errorCode, done);
  });

  it('should successfully remove an app by name', done => {
    http.sendPostRequestSuccess(path, token, { name }, OK, done);
  });

  it('should silently do nothing when the app no longer exists', done => {
    http.sendPostRequestSuccess(path, token, { name }, OK, done);
  });

  [constants.HMH_APP, constants.CB_APP].forEach(reservedName => {
    it(`should return error for reserved app named "${reservedName}"`, done => {
      const params = { name: reservedName };
      const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });
});
