import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.AUTHZ_REGISTER;

const name = `uds.bvt.authz.register.test.${seed.buildNumber}`;
const url = 'https://hmheng-uds.test.app/callback';
const mockAuthz = { name, url };

const OK = { ok: true };


describe('authz.register', () => {
  after(seed.authz.removeAuthz([name]));

  it('should throw an error for an invalid name', done => {
    const params = {
      name: 'invalid-fail*name',
      url,
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_NAME;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should throw an error for an invalid url', done => {
    const params = {
      name,
      url: '',
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_URL;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should successfully register an authz configuration', done => {
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, mockAuthz, OK, done);
  });

  it('should reject registering an authz configuration with the same name', done => {
    const params = {
      name,
      url: 'https://hmheng-uds.test.app/another',
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_NAME_IN_USE;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });
});
