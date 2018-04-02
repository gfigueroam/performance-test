import common from 'hmh-bfm-nodejs-common';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const key = `uds.bvt.data.user.get.test.${seed.buildNumber}`;
const requestor = 'data.user.test.requestor.1';
const data = 'this is some data';

const path = paths.DATA_USER_GET;
const token = common.test.tokens.serviceToken;

const OK = { ok: true };


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

  it('returns null when retrieving a non-existent key', done => {
    const params = {
      key: 'data.user.get.non.existent.key',
      requestor,
    };
    http.sendPostRequestSuccess(path, token, params, OK, done);
  });

  it('retrieves text data correctly', done => {
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
});
