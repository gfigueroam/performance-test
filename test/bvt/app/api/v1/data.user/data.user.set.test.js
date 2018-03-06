import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const key = `uds.bvt.data.user.set.test.${seed.buildNumber}`;
const annotationKey = `uds.bvt.data.user.set.annotation.test.${seed.buildNumber}`;
const requestor = 'data.user.test.requestor.1';
const data = 'this is some data';

const path = paths.DATA_USER_SET;
const token = tokens.serviceToken;

const OK = { ok: true };


describe('data.user.set', () => {
  after(done => {
    seed.user.unset({ key, user: requestor }, () => {
      seed.user.unset({ key: annotationKey, user: requestor }, done);
    });
  });

  describe('validates the type and the data against that type', () => {
    it('returns an error when type is not recognized', done => {
      const params = { data, key, requestor, type: 'some-invalid-type' };
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });

    it('returns an error when type is "text" but data is instead an object', done => {
      const params = { data: {}, key, requestor, type: 'text' };
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });

    it('returns an error when type is "annotation" but data does not conform to the annotation schema', done => {
      const params = { data: {}, key, requestor, type: 'annotation' };
      const errorCode = errors.codes.ERROR_CODE_INVALID_DATA;
      http.sendPostRequestError(path, token, params, errorCode, done);
    });
  });

  it('successfully sets text data', done => {
    // Ensure nothing already set
    const getParams = { key, requestor };
    http.sendPostRequestSuccess(paths.DATA_USER_GET, token, getParams, OK, () => {
      // Set the value
      const setParams = { data, key, requestor, type: 'text' };
      http.sendPostRequestSuccess(path, token, setParams, OK, () => {
        // Verify it can now be read
        const result = {
          ok: true,
          result: {
            createdBy: requestor,
            data,
            key,
            type: 'text',
          },
        };
        http.sendPostRequestSuccess(paths.DATA_USER_GET, token, getParams, result, done);
      });
    });
  });

  it('successfully sets annotation data', done => {
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
    const getParams = { key: annotationKey, requestor };
    http.sendPostRequestSuccess(paths.DATA_USER_GET, token, getParams, OK, () => {
      // Set the value
      const setParams = { data: annotationData, key: annotationKey, requestor, type: 'annotation' };
      http.sendPostRequestSuccess(path, token, setParams, OK, () => {
        // Verify it can now be read
        const result = {
          ok: true,
          result: {
            createdBy: requestor,
            data: annotationData,
            key: annotationKey,
            type: 'annotation',
          },
        };
        http.sendPostRequestSuccess(paths.DATA_USER_GET, token, getParams, result, done);
      });
    });
  });
});
