import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.user.share.test.${seed.buildNumber}`;
const data = 'authz.share.test.data';
const authz = 'uds_authz_allow';
const ctx = 'authz.test.ctx.1';
const requestor = 'data.admin.test.requestor.1';

let shareId;

describe('data.user.share', () => {
  before((done) => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user: requestor,
    }, done);
  });

  after((done) => {
    seed.user.unset({
      key,
      user: requestor,
    }, done);
  });

  it('shares an existing data value correctly with a unique id', (done) => {
    http.sendPostRequest(paths.DATA_USER_SHARE, tokens.serviceToken, {
      authz,
      ctx,
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body.ok).to.equal(true);

      shareId = response.body.result.id;
      expect(shareId).not.to.equal(undefined);

      done();
    });
  });

  it('retrieves a shared piece of content by share id', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET_SHARED, tokens.serviceToken, {
      id: shareId,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data,
          key,
        },
      });
      done();
    });
  });

  it('unshares a piece of content by share id', (done) => {
    http.sendPostRequest(paths.DATA_USER_UNSHARE, tokens.serviceToken, {
      id: shareId,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({ ok: true });
      done();
    });
  });

  it('should no longer find a piece of unshared content', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET_SHARED, tokens.serviceToken, {
      id: shareId,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND,
        ok: false,
      });
      done();
    });
  });

  it('should still be able to load the original data item', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken, {
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data,
          key,
          user: requestor,
        },
      });
      done();
    });
  });
});
