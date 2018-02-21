import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const key = `uds.bvt.data.user.set.test.${seed.buildNumber}`;
const annotationKey = `uds.bvt.data.user.set.annotation.test.${seed.buildNumber}`;
const requestor = 'data.user.test.requestor.1';
const data = 'this is some data';

describe('data.user.set', () => {
  after(done => {
    seed.user.unset({ key, user: requestor }, () => {
      seed.user.unset({ key: annotationKey, user: requestor }, done);
    });
  });

  describe('validates the type and the data against that type', () => {
    it('returns an error when type is not recognized', (done) => {
      http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
        { data, key, requestor, type: 'some-invalid-type' }, (err, response) => {
          expect(err).to.equal(null);
          expect(response.body).to.deep.equal({
            error: errors.codes.ERROR_CODE_INVALID_DATA_TYPE,
            ok: false,
          });
          done();
        });
    });

    it('returns an error when type is "text" but data is instead an object', (done) => {
      http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
        { data: {}, key, requestor, type: 'text' }, (err, response) => {
          expect(err).to.equal(null);
          expect(response.body).to.deep.equal({
            error: errors.codes.ERROR_CODE_INVALID_DATA,
            ok: false,
          });
          done();
        });
    });

    it('returns an error when type is "annotation" but data does not conform to the annotation schema', (done) => {
      http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
        { data: {}, key, requestor, type: 'annotation' }, (err, response) => {
          expect(err).to.equal(null);
          expect(response.body).to.deep.equal({
            error: errors.codes.ERROR_CODE_INVALID_DATA,
            ok: false,
          });
          done();
        });
    });
  });

  it('successfully sets text data', (done) => {
    // Ensure nothing already set.
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
      { key, requestor }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
        });
        // Set the value
        http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
          { data, key, requestor, type: 'text' }, (err2, response2) => {
            expect(err2).to.equal(null);
            expect(response2.body).to.deep.equal({
              ok: true,
            });
            // Verify it can now be read
            http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
              { key, requestor }, (err3, response3) => {
                expect(err3).to.equal(null);
                expect(response3.body).to.deep.equal({
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
  });

  it('successfully sets annotation data', (done) => {
    const annotationData = {
      createdAt: 123,
      createdBy: 'USER1',
      locator: {
        contentId: 'C',
        moduleId: 'M',
        offset: 12345,
      },
      text: 'This is annotation text',
    };
    // Ensure nothing already set.
    http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
      { key: annotationKey, requestor }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
        });
        // Set the value
        http.sendPostRequest(paths.DATA_USER_SET, tokens.serviceToken,
          { data: annotationData, key: annotationKey, requestor, type: 'annotation' }, (err2, response2) => {
            expect(err2).to.equal(null);
            expect(response2.body).to.deep.equal({
              ok: true,
            });
            // Verify it can now be read
            http.sendPostRequest(paths.DATA_USER_GET, tokens.serviceToken,
              { key: annotationKey, requestor }, (err3, response3) => {
                expect(err3).to.equal(null);
                expect(response3.body).to.deep.equal({
                  ok: true,
                  result: {
                    createdBy: requestor,
                    data: annotationData,
                    key: annotationKey,
                    type: 'annotation',
                  },
                });
                done();
              });
          });
      });
  });
});
