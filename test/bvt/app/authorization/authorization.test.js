import common from 'hmh-bfm-nodejs-common';
import http from '../../../common/helpers/http';
import paths from '../../../common/helpers/paths';
import seed from '../../../common/seed';
import errors from '../../../../app/models/errors';
import {
    noUniqueIdentifierKey,
    noUniqueIdentifierValue,
  } from '../../../common/helpers/tokens';

const path = paths.DATA_USER_QUERY;
const keyPrefix = `uds.bvt.data.user.query.test.${seed.buildNumber}`;
const requestor = 'data.user.query.test.requestor.1';

const token = common.test.tokens.serviceToken;

describe('authorization', () => {
  describe('succeeds', () => {
    it('if the request has an ok uniqueIdentifier in the claim', done => {
      const result = {
        ok: true,
        result: [],
      };
      const params = { keyPrefix, requestor };
      http.sendPostRequestSuccess(path, token, params, result, done);
    });
  });
  describe('fails', () => {
    it('if the request has no auth token', done => {
      const params = { keyPrefix, requestor };
      const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
      http.sendPostRequestError(path, '', params, errorCode, done);
    });
    it('if the request uniqueIdentifier has no value in the claim', done => {
      // console.log(token);
      const params = { keyPrefix, requestor };
      const errorCode = errors.codes.ERROR_CODE_INVALID_AUTHZ;
      http.sendPostRequestError(
        path,
        noUniqueIdentifierValue,
        params,
        errorCode,
        done,
      );
    });
    it('if the request has no uniqueIdentifier in the claim', done => {
      // console.log(token);
      const params = { keyPrefix, requestor };
      const errorCode = errors.codes.ERROR_CODE_INVALID_AUTHZ;
      http.sendPostRequestError(
        path,
        noUniqueIdentifierKey,
        params,
        errorCode,
        done,
      );
    });
  });
});
