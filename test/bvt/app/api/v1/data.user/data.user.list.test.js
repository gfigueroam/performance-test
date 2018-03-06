import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key1 = `uds.bvt.data.user.list.test.1.${seed.buildNumber}`;
const key2 = `uds.bvt.data.user.list.test.2.${seed.buildNumber}`;
const requestor = `data.user.test.requestor.${seed.buildNumber}`;
const data = 'this is some data';

const path = paths.DATA_USER_LIST;
const token = tokens.serviceToken;

const OK = { ok: true };

let shareId;


describe('data.user.list', () => {
  after(done => {
    seed.user.unset({
      key: key1,
      user: requestor,
    }, () => {
      seed.user.unset({
        key: key2,
        user: requestor,
      }, () => {
        http.sendPostRequest(
          paths.DATA_USER_UNSHARE,
          token,
          { id: shareId, requestor },
          done,
        );
      });
    });
  });

  it('returns an empty list when no keys are set', done => {
    const result = {
      ok: true,
      result: {
        keys: [],
        shared: [],
      },
    };
    http.sendPostRequestSuccess(path, token, { requestor }, result, done);
  });

  it('returns a list of one key', done => {
    const setParams = { data, key: key1, requestor, type: 'text' };
    http.sendPostRequestSuccess(paths.DATA_USER_SET, token, setParams, OK, () => {
      const result = {
        ok: true,
        result: {
          keys: [key1],
          shared: [],
        },
      };
      http.sendPostRequestSuccess(path, token, { requestor }, result, done);
    });
  });

  it('returns a list of two keys', done => {
    const setParams = { data, key: key2, requestor, type: 'text' };
    http.sendPostRequestSuccess(paths.DATA_USER_SET, token, setParams, OK, () => {
      const result = {
        ok: true,
        result: {
          keys: [key1, key2],
          shared: [],
        },
      };
      http.sendPostRequestSuccess(path, token, { requestor }, result, done);
    });
  });

  it('returns shared items as well', done => {
    // First share an item
    const shareParams = { authz: 'uds_authz_deny', ctx: 'bvt', key: key2, requestor };
    http.sendPostRequest(paths.DATA_USER_SHARE, token, shareParams, (err2, response2) => {
      shareId = response2.body.result.id;

      expect(err2).to.equal(null);
      expect(response2.body).to.deep.equal({
        ok: true,
        result: {
          id: shareId,
        },
      });

      // Item should appear in shared list
      const result = {
        ok: true,
        result: {
          keys: [key1, key2],
          shared: [shareId],
        },
      };
      http.sendPostRequestSuccess(path, token, { requestor }, result, done);
    });
  });
});
