import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const key = `uds.bvt.user.token.test.${seed.buildNumber}`;
const requestor = 'e0f96e77-55b5-493f-b347-42f8c7907072';
const data = 'this is some data';

const path = paths.DATA_USER_GET;


describe('data.user.get', () => {
  before(done => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user: requestor,
    }, done);
  });

  after(done => {
    seed.user.unset({
      key,
      user: requestor,
    }, done);
  });

  it('retrieves text data correctly with a service token', done => {
    const token = tokens.serviceToken;
    const params = { key, requestor };
    const result = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
        type: 'text',
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('retrieves text data with owners user token and no requestor', done => {
    const params = { key };
    const token = tokens.userTokens.internal;
    const result = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
        type: 'text',
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('retrieves text data with owners user token and matching requestor', done => {
    const params = { key, requestor };
    const token = tokens.userTokens.internal;
    const result = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
        type: 'text',
      },
    };
    http.sendPostRequestSuccess(path, token, params, result, done);
  });

  it('throws an error when user token doesnt match requestor', done => {
    const params = { key, requestor: 'someone-else' };
    const token = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_INVALID_USER;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });
});
