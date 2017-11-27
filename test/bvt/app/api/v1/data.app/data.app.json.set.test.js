import apiTestStub from '../stub';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.DATA_APP_JSON_SET;

const app = `uds.bvt.data.app.json.set.app.${seed.buildNumber}`;
const data = { data: 'true', other_data: 'false' };
const key = `uds.bvt.data.app.json.set.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.app.json.set', () => {
  it('should throw an error for an invalid data object', done => {
    const invalidData = [];
    const params = {
      app,
      data: invalidData,
      key,
      user,
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  apiTestStub('data.app', 'json.set', { app, data, key, user });
});
