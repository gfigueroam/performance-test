import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const keyPrefix = `uds.bvt.data.user.query.test.${seed.buildNumber}`;
const key1 = `${keyPrefix}.key.1`;
const key2 = `uds.bvt.data.user.query.some.other.test.${seed.buildNumber}.value.2`;
const key3 = `${keyPrefix}.key.3`;
const requestor = 'data.user.query.test.requestor.1';

const path = paths.DATA_USER_QUERY;
const serviceToken = tokens.serviceToken;

describe('data.user.query', () => {
  before((done) => {
    seed.user.set({
      data: 'value 1',
      key: key1,
      type: 'text',
      user: requestor,
    }, () => {
      seed.user.set({
        data: 'value 2',
        key: key2,
        type: 'text',
        user: requestor,
      }, () => {
        seed.user.set({
          data: 'value 3',
          key: key3,
          type: 'text',
          user: requestor,
        }, done);
      });
    });
  });

  after((done) => {
    seed.user.unset({
      key: key1,
      user: requestor,
    }, () => {
      seed.user.unset({
        key: key2,
        user: requestor,
      }, () => {
        seed.user.unset({
          key: key3,
          user: requestor,
        }, done);
      });
    });
  });

  it('fails if the request has no auth token', done => {
    const params = { keyPrefix, requestor };
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, '', params, errorCode, done);
  });

  it('fails if the "keyPrefix" parameter is not present', done => {
    const params = { requestor };
    const errorCode = 'missing_arg';
    const errorDetails = 'Required argument "keyPrefix" missing.';
    http.sendPostRequestErrorDetails(path, serviceToken, params, errorCode, errorDetails, done);
  });

  it('fails if the "requestor" parameter is not present when using a service token', done => {
    const params = { keyPrefix };
    const errorCode = errors.codes.ERROR_CODE_USER_NOT_FOUND;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('returns an empty list when no values match keyPrefix', done => {
    const params = { keyPrefix: 'something.else', requestor };
    const result = { ok: true, result: [] };
    http.sendPostRequestSuccess(path, serviceToken, params, result, done);
  });

  it('fails if the "owner" parameter doesnt match "requestor" parameter', done => {
    const params = {
      keyPrefix,
      owner: 'someone-else',
      requestor,
    };
    const errorCode = errors.codes.ERROR_CODE_AUTH_INVALID;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('returns a list of results that match keyPrefix', done => {
    const params = { keyPrefix, requestor };
    const result = {
      ok: true,
      result: [
        {
          createdBy: requestor,
          data: 'value 1',
          key: key1,
          type: 'text',
        },
        {
          createdBy: requestor,
          data: 'value 3',
          key: key3,
          type: 'text',
        },
      ],
    };
    http.sendPostRequestSuccess(path, serviceToken, params, result, done);
  });
});
