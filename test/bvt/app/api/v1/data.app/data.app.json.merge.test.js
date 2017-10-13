import apiTestStub from '../stub';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.DATA_APP_JSON_MERGE;

const app = `uds.bvt.data.app.json.merge.app.${seed.buildNumber}`;
const data = { merge_data: 'true', merge_sample_data: 'false' };
const key = `uds.bvt.data.app.json.merge.test.${seed.buildNumber}`;
const password = 'password1234abcd';
const user = 'data.admin.test.user.1';

describe('data.app.json.merge', () => {
  it('should throw an error for an invalid data object', done => {
    const invalidData = 'test_string';
    const params = {
      app,
      data: invalidData,
      key,
      password,
      user,
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  apiTestStub('data.app', 'json.merge', { app, data, key, password, user });
});
