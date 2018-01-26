import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const path = paths.DATA_USER_SHARE;
const serviceToken = tokens.serviceToken;

const key = `uds.bvt.data.user.share.test.${seed.buildNumber}`;
const data = 'authz.share.test.data';
const authz = 'uds_authz_allow';
const ctx = 'authz.share.test.ctx.1';
const requestor = 'data.user.share.test.requestor.1';

let shareId;
let anotherShareId;

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

  it('should return error when the key is invalid', done => {
    const params = { authz, ctx, key: '-*fail-*', requestor };
    const errorCode = errors.codes.ERROR_CODE_INVALID_KEY;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return error when the authz is invalid', done => {
    const params = { authz: 'not*valid!', ctx, key, requestor };
    const errorCode = errors.codes.ERROR_CODE_INVALID_AUTHZ;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return error when requestor does not have access', done => {
    const params = { authz, ctx, key, owner: 'different.user.account', requestor };
    const errorCode = errors.codes.ERROR_CODE_AUTH_INVALID;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('shares an existing data value correctly with a unique id', (done) => {
    http.sendPostRequest(path, serviceToken, {
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

  it('shares an existing data value again with a new unique id', (done) => {
    http.sendPostRequest(path, serviceToken, {
      authz,
      ctx,
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body.ok).to.equal(true);

      anotherShareId = response.body.result.id;
      expect(shareId).not.to.equal(anotherShareId);
      expect(anotherShareId).not.to.equal(undefined);

      done();
    });
  });

  it('retrieves a shared piece of content by share id', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET_SHARED, serviceToken, {
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
    http.sendPostRequest(paths.DATA_USER_UNSHARE, serviceToken, {
      id: shareId,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({ ok: true });
      done();
    });
  });

  it('should no longer find a piece of unshared content', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET_SHARED, serviceToken, {
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
    http.sendPostRequest(paths.DATA_USER_GET, serviceToken, {
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

  it('should still be able to load the shared content by other share id', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET_SHARED, serviceToken, {
      id: anotherShareId,
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

  it('unshares a piece of content by the other share id', (done) => {
    http.sendPostRequest(paths.DATA_USER_UNSHARE, serviceToken, {
      id: anotherShareId,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({ ok: true });
      done();
    });
  });
});
