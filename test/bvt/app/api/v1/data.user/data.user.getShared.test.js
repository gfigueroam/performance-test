import chai from 'chai';
import uuid from 'uuid';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const path = paths.DATA_USER_GET_SHARED;
const serviceToken = tokens.serviceToken;

const key = `uds.bvt.data.user.getShared.test.${seed.buildNumber}`;
const data = 'authz.getShared.test.data';
const authz = 'uds_authz_allow';
const ctx = 'authz.getShared.test.ctx.1';
const requestor = 'data.user.getShared.test.requestor.1';

let allowShareId;
let denyShareId;

describe('data.user.getShared', () => {
  before((done) => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user: requestor,
    }, done);
  });

  after((done) => {
    seed.user.unshare({
      id: allowShareId,
      user: requestor,
    }, () => {
      seed.user.unshare({
        id: denyShareId,
        user: requestor,
      }, done);
    });
  });

  it('should return error when no token is provided', done => {
    const errorCode = errors.codes.ERROR_CODE_AUTH_NO_TOKEN;
    http.sendPostRequestError(path, '', {}, errorCode, done);
  });

  it('should return error when the share id is invalid', done => {
    const params = { id: 'some.share.id.1' };
    const errorCode = errors.codes.ERROR_CODE_INVALID_SHARE_ID;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return error when the share id does not exist', done => {
    const params = { id: uuid.v4() };
    const errorCode = errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('shares an existing data value correctly with a unique id', (done) => {
    const params = { authz, ctx, key, requestor };
    http.sendPostRequest(paths.DATA_USER_SHARE, serviceToken, params, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body.ok).to.equal(true);

      allowShareId = response.body.result.id;
      expect(allowShareId).not.to.equal(undefined);

      done();
    });
  });

  it('shares an existing data value correctly with a different authz', (done) => {
    const params = { authz: 'uds_authz_deny', ctx, key, requestor };
    http.sendPostRequest(paths.DATA_USER_SHARE, serviceToken, params, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body.ok).to.equal(true);

      denyShareId = response.body.result.id;
      expect(denyShareId).not.to.equal(undefined);

      done();
    });
  });

  it('should return error when the share id does not exist', done => {
    const params = { id: uuid.v4() };
    const errorCode = errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return error when authz is denied', done => {
    const params = { id: denyShareId };
    const errorCode = errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED;
    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('retrieves a shared piece of content by share id', (done) => {
    const params = { id: allowShareId };
    http.sendPostRequest(path, serviceToken, params, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: { data, key },
      });
      done();
    });
  });

  it('should return an error when the data content is removed', done => {
    seed.user.unset({ key, user: requestor }, (unsetError) => {
      if (unsetError) {
        done(unsetError);
      } else {
        const params = { id: allowShareId };
        const errorCode = errors.codes.ERROR_CODE_KEY_NOT_FOUND;
        http.sendPostRequestError(path, serviceToken, params, errorCode, done);
      }
    });
  });
});
