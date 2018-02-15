import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.user.get.test.${seed.buildNumber}`;
const requestor = 'data.user.test.requestor.1';
const data = 'this is some data';

describe('data.user.get', () => {
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

  it('returns null when retrieving a non-existent key', (done) => {
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken, {
      key: 'data.user.get.non.existent.key',
      requestor,
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
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          createdBy: requestor,
          data,
          key,
          type: 'text',
        },
      });
      done();
    });
  });
});
