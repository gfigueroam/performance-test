import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';


const path = paths.AUTHZ_REMOVE;
const serviceToken = common.test.tokens.serviceToken;

const name = `uds.bvt.authz.remove.test.${seed.buildNumber}`;
const url = 'https://hmheng-uds.test.app/callback';
const mockAuthz = { name, url };

const OK = { ok: true };


describe('authz.remove', () => {
  before(async () => {
    await seed.authz.addAuthz(mockAuthz);
  });

  it('should return error when the request has a user token', done => {
    const params = { name };
    const userToken = common.test.tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('should throw an error for an invalid name', done => {
    const params = { name: 'invalid-fail*name' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_NAME;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should not throw an error if the name does not exist', done => {
    const params = { name: 'does.not.exist' };
    http.sendPostRequestSuccess(path, serviceToken, params, OK, done);
  });

  it('should successfully remove an authz configuration', done => {
    const params = { name };
    http.sendPostRequestSuccess(path, serviceToken, params, OK, done);
  });

  it('should no longer find the authz configuration with the given name', done => {
    const errorCode = errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
    http.sendPostRequestError(paths.AUTHZ_INFO, serviceToken, { name }, errorCode, done);
  });
});
