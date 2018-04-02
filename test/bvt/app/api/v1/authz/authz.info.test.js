import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';
import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';


const path = paths.AUTHZ_INFO;

const name = `uds.bvt.authz.info.test.${seed.buildNumber}`;
const url = 'http://localhost:5200/authz';

const serviceToken = common.test.tokens.serviceToken;

const params = { name };
const OK = { ok: true };


describe('authz.info', () => {
  after(seed.authz.removeAuthz([name]));

  it('should return error when the request has no auth token', done => {
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, '', params, errorCode, done);
  });

  it('should return error when the request has a user token', done => {
    const userToken = common.test.tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('should return error when there is no authz configuration with the given name', done => {
    const errorCode = errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return information about an existing authz configuration', done => {
    const authzParams = { name, url };
    http.sendPostRequestSuccess(paths.AUTHZ_REGISTER, serviceToken, authzParams, OK, () => {
      const result = { ok: true, result: authzParams };
      http.sendPostRequestSuccess(paths.AUTHZ_INFO, serviceToken, params, result, done);
    });
  });
});
