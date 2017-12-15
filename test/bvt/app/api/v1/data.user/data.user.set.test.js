import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
// import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.user.set.test.${seed.buildNumber}`;
const user = 'data.user.test.user.1';
const data = 'this is some data';

describe('data.user.set', () => {
  after((done) => {
    seed.user.unset({
      key,
      user,
    }, done);
  });

  it('successfully sets text data', (done) => {
    // Ensure nothing already set.
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
      { key, user }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
        });
        // Set the value
        http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
          { data, key, type: 'text', user }, (err2, response2) => {
            expect(err2).to.equal(null);
            expect(response2.body).to.deep.equal({
              ok: true,
            });
            // Verify it can now be read
            http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
              { key, user }, (err3, response3) => {
                expect(err3).to.equal(null);
                expect(response3.body).to.deep.equal({
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
      });
  });

  /*
  TODO
  it('successfully sets image data')
  it('successfully sets video data')
  */
});
