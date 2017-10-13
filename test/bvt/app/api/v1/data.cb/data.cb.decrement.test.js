import apiTestStub from '../stub';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';

const path = paths.DATA_CB_DECREMENT;

const key = `uds.bvt.data.cb.decrement.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.cb.decrement', () => {
  it('prevents decrementing a key without an authorized service token', done => {
    const params = { key, user }; // Valid request
    const emptyToken = ''; // Missing token should fail
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;

    http.sendPostRequestError(path, emptyToken, params, errorCode, done);
  });

  apiTestStub('data.cb', 'decrement', { key, user });
});
