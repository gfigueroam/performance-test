import chai from 'chai';
import sinon from 'sinon';

import mockIds from '../../../common/helpers/ids';

import auth from '../../../../app/auth';
import config from '../../../../app/config';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

const expect = chai.expect;

describe('ids', () => {
  const owner = 'owner.user.test.1';
  const requestor = 'requestor.user.test.1';

  const serviceToken = config.get('uds:test_service_token');
  const swatchCtx = {
    auth: {
      token: serviceToken,
    },
    logger,
  };

  before(() => {
    sinon.stub(rest, 'get');
  });

  after(() => {
    rest.get.restore();
  });

  it('should return false if header uses stub auth with wrong ids', async () => {
    swatchCtx.auth.useStubAuth = true;
    const result = await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, owner]);
    expect(result).to.equal(false);
  });

  it('should return true if header uses stub auth with mock ids', async () => {
    swatchCtx.auth.useStubAuth = true;
    const result = await auth.ids.hasAccessTo.apply(
      swatchCtx,
      [mockIds.mockTeacherId, mockIds.mockStudentId],
    );
    expect(result).to.equal(true);
  });

  it('should return true if owner matches requestor', async () => {
    swatchCtx.auth.useStubAuth = false;
    const result = await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, requestor]);
    expect(result).to.equal(true);
  });

  it('should handle an error thrown by call to rest client', async () => {
    rest.get.throws('rest_client_error');
    try {
      await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, owner]);
      expect(false).to.equal(true);
    } catch (error) {
      expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
    }
  });

  it('should return true if owner id is included in list of students', async () => {
    rest.get.returns([
      { refId: 'some-ref-id' },
      { refId: 'some-other-ref-id' },
      { refId: owner },
      { refId: 'the-last-ref-id' },
    ]);
    const result = await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, owner]);
    expect(result).to.equal(true);
  });

  it('should return false if requestor has no students', async () => {
    rest.get.returns([]);
    const result = await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, owner]);
    expect(result).to.equal(false);
  });

  it('should return false if owner id is not found in list of students', async () => {
    rest.get.returns([
      { refId: 'some-ref-id' },
      { refId: 'some-other-ref-id' },
      { refId: 'the-last-ref-id' },
    ]);
    const result = await auth.ids.hasAccessTo.apply(swatchCtx, [requestor, owner]);
    expect(result).to.equal(false);
  });
});
