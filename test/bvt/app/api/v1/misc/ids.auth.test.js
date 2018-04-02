import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import idsMock from '../../../../../common/helpers/ids';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const keyPrefix = `uds.bvt.ids.auth.test.${seed.buildNumber}`;

const path = paths.DATA_USER_QUERY;
const token = common.test.tokens.serviceToken;
const error = errors.codes.ERROR_CODE_AUTH_INVALID;

describe('ids.auth', () => {
  it('throws an auth error when requestor and owner dont match', done => {
    http.sendPostRequestError(path, token, {
      keyPrefix,
      owner: 'some-owner',
      requestor: 'some-requestor',
    }, error, done);
  });

  it('returns a result when the mock ids ids are used', done => {
    http.sendPostRequestSuccess(path, token, {
      keyPrefix,
      owner: idsMock.mockStudentId,
      requestor: idsMock.mockTeacherId,
    }, {
      ok: true,
      result: [],
    }, done);
  });

  it('throws an error when a mock student requests mock teacher content', done => {
    http.sendPostRequestError(path, token, {
      keyPrefix,
      owner: idsMock.mockTeacherId,
      requestor: idsMock.mockStudentId,
    }, error, done);
  });

  it('throws an error when real teacher and student ids are used', done => {
    http.sendPostRequestError(path, token, {
      keyPrefix,
      owner: 'fc79a58a-0fbb-4841-8c1d-b94a8bb08cc7',
      requestor: '7c5a56ae-49f6-473f-83dc-090467b71995',
    }, error, done);
  });
});
