import apiTestStub from '../stub';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.APPS_REGISTER;

const name = `uds.bvt.apps.register.test.${seed.buildNumber}`;
const password = 'password1234abcd';
const quota = 1024;

describe('apps.register', () => {
  it('should throw an error for an invalid quota', done => {
    const params = {
      name,
      password,
      quota: 'abc',
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  apiTestStub('apps', 'register', { name, password, quota });
});
