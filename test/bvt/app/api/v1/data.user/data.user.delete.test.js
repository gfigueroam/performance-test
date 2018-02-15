import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const key = `uds.bvt.data.user.delete.test.${seed.buildNumber}`;
const requestor = 'data.admin.test.requestor.1';
const data = 'this is some data';

describe('data.user.delete', () => {
  before((done) => {
    seed.user.set({
      data,
      key,
      type: 'text',
      user: requestor,
    }, done);
  });

  it('deletes an existing value', (done) => {
    // Ensure something already set.
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
      { key, requestor }, (err, response) => {
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
        // delete the value
        http.sendPostRequest(paths.DATA_USER_DELETE, tokens.serviceToken,
          { key, requestor }, (err2, response2) => {
            expect(err2).to.equal(null);
            expect(response2.body).to.deep.equal({
              ok: true,
            });
            // Verify nothing set now
            http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
              { key, requestor }, (err3, response3) => {
                expect(err3).to.equal(null);
                expect(response3.body).to.deep.equal({
                  ok: true,
                });
                done();
              });
          });
      });
  });
});
