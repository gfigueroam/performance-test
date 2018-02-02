import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const quota = 1024;
const NEW_QUOTA = 2345;
const name = `uds.bvt.apps.setPerUserQuota.test.${seed.buildNumber}`;

const path = paths.APPS_SET_PER_USER_QUOTA;

describe('apps.setPerUserQuota', () => {
  after((done) => {
    const params = {
      name,
    };
    http.sendPostRequestSuccess(paths.APPS_REMOVE, tokens.serviceToken, params, {
      ok: true,
    }, done);
  });

  it('should return error when there is no app with the given name', done => {
    http.sendPostRequestError(path, tokens.serviceToken, {
      name,
      quota: 1111,
    }, errors.codes.ERROR_CODE_APP_NOT_FOUND, done);
  });

  it('should update quota to a valid value', done => {
    const params = {
      name,
      quota,
    };
    seed.apps.addApp(params)
    .then(() => {
      params.quota = NEW_QUOTA;
      return new Promise((resolve, reject) => {
        http.sendPostRequestSuccess(path,
          tokens.serviceToken, params, {
            ok: true,
          }, (err) => {
            if (err) {
              return reject(err);
            }
            return http.sendPostRequestSuccess(paths.APPS_INFO, tokens.serviceToken, {
              name,
            }, {
              ok: true,
              result: params,
            }, (err2) => {
              if (err2) {
                return reject(err2);
              }
              return resolve();
            });
          },
        );
      });
    })
    .then(done)
    .catch(done);
  });

  it('should return error when the request has a user token', done => {
    const params = { name, quota };
    const userToken = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('should fail to update quota if quota is too high', done => {
    const params = {
      name,
      quota,
    };
    params.quota = (1024 * 1024) + 1;
    http.sendPostRequestError(path, tokens.serviceToken,
      params, errors.codes.ERROR_CODE_INVALID_QUOTA, () => (
        http.sendPostRequestSuccess(paths.APPS_INFO, tokens.serviceToken, {
          name,
        }, {
          ok: true,
          result: {
            name,
            quota: NEW_QUOTA,
          },
        },
        done)
      ));
  });
});
