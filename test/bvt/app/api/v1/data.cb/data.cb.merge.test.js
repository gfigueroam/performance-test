import apiTestStub from '../stub';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';

const path = paths.DATA_CB_MERGE;

const key = `uds.bvt.data.cb.merge.test.${seed.buildNumber}`;
const data = { k1: 'Hello', k2: 'Goodbye' };
const user = 'data.admin.test.user.1';

describe('data.cb.merge', () => {
  it('prevents merging a property without an authorized service token', done => {
    const params = { data, key, user }; // Valid request
    const emptyToken = ''; // Missing token should fail
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;

    http.sendPostRequestError(path, emptyToken, params, errorCode, done);
  });

  apiTestStub('data.cb', 'merge', { data, key, user });
});
