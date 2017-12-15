import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.user.get.test.${seed.buildNumber}`;
const user = 'data.user.test.user.1';
const data = 'this is some data';

describe('data.user.get', () => {
  before((done) => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user,

    }, done);
  });

  after((done) => {
    seed.user.unset({
      key,
      user,
    }, done);
  });

  it('returns null when retrieving a non-existent key', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken, {
      key: 'data.user.get.non.existent.key',
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
      });
      done();
    });
  });

  it('retrieves text data correctly', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken, {
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data,
          key,
          user,
        },
      });
      done();
    });
  });

  /* TODO
  it('retrieves image data correctly')
  it('retrieves video data correctly')
  */
});
