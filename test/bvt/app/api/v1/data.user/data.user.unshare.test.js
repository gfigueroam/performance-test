import chai from 'chai';
import uuid from 'uuid';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const path = paths.DATA_USER_UNSHARE;
const token = tokens.serviceToken;

const key = `uds.bvt.data.user.unshare.test.${seed.buildNumber}`;
const data = 'authz.unshare.test.data';
const authz = 'uds_authz_allow';
const ctx = 'authz.unshare.test.ctx.1';
const requestor = 'data.user.unshare.test.requestor.1';

let shareId;


describe('data.user.unshare', () => {
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

  it('should return error when no token is provided', done => {
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, '', {}, errorCode, done);
  });

  it('should return error when the share id is invalid', done => {
    const params = { id: 'some.share.id.1' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_SHARE_ID;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('should return error when the share id does not exist', done => {
    const params = { id: uuid.v4(), requestor };
    const errorCode = errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('shares an existing data value correctly with a unique id', done => {
    http.sendPostRequest(paths.DATA_USER_SHARE, token, {
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

  it('should return error when requestor does not have access', done => {
    const params = { id: shareId, owner: 'different.user.account', requestor };
    const errorCode = errors.codes.ERROR_CODE_AUTH_INVALID;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });

  it('unshares a piece of content by share id', done => {
    const params = { id: shareId, requestor };
    http.sendPostRequest(path, token, params, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({ ok: true });
      done();
    });
  });

  it('should return error after an item has already been unshared', done => {
    const params = { id: shareId, requestor };
    const errorCode = errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND;
    http.sendPostRequestError(path, token, params, errorCode, done);
  });
});
