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

describe('data.user.list', () => {
  after((done) => {
    seed.user.unset({
      key: key1,
      user: requestor,
    }, () => {
      seed.user.unset({
        key: key2,
        user: requestor,
      }, done);
    });
  });

  it('returns an empty list when no keys are set', (done) => {
    http.sendPostRequest(paths.DATA_USER_LIST, tokens.serviceToken,
      { requestor }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: {
            keys: [],
          },
        });
        done();
      });
  });

  it('returns a list of one key', (done) => {
    http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
      { data, key: key1, requestor, type: 'text' }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
        });
        http.sendPostRequest(paths.DATA_USER_LIST, tokens.serviceToken,
          { requestor }, (err, response) => {
            expect(err).to.equal(null);
            expect(response.body).to.deep.equal({
              ok: true,
              result: {
                keys: [key1],
              },
            });
            done();
          });
      });
  });

  it('returns a list of two keys', (done) => {
    http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
      { data, key: key2, requestor, type: 'text' }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
        });
        http.sendPostRequest(paths.DATA_USER_LIST, tokens.serviceToken,
          { requestor }, (err, response) => {
            expect(err).to.equal(null);
            expect(response.body).to.deep.equal({
              ok: true,
              result: {
                keys: [key1, key2],
              },
            });
            done();
          });
      });
  });
});
