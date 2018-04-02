import common from 'hmh-bfm-nodejs-common';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const key = `uds.bvt.data.user.delete.test.${seed.buildNumber}`;
const requestor = 'data.admin.test.requestor.1';
const data = 'this is some data';

const token = common.test.tokens.serviceToken;
const params = { key, requestor };

const OK = { ok: true };


describe('data.user.delete', () => {
  before(done => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user: requestor,
    }, done);
  });

  it('deletes an existing value', done => {
    // Ensure something already set.
    const getResult = {
      ok: true,
      result: {
        createdBy: requestor,
        data,
        key,
        type: 'text',
      },
    };
    http.sendPostRequestSuccess(paths.DATA_USER_GET, token, params, getResult, () => {
      // Delete the value
      http.sendPostRequestSuccess(paths.DATA_USER_DELETE, token, params, OK, () => {
        // Verify nothing set now
        http.sendPostRequestSuccess(paths.DATA_USER_GET, token, params, OK, done);
      });
    });
  });
});
