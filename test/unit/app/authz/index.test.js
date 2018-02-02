import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../app/authz';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

import dbAuthz from '../../../../app/db/authz';

const expect = chai.expect;

let restStub;
let authzStub;

const mockCtx = {
  database: {
    consistentRead: false,
  },
  logger,
};

const shareId = 'testshareid1';
const requestor = 'user-id-requestor';

// Define a fake authz configuration record in the DB
const clientAuthzId = 'some-client-authz-id;';
const clientAuthzUrl = 'https://test-client.hmhco.com/authz';
const mockAuthzResult = {
  name: clientAuthzId,
  url: clientAuthzUrl,
};

// Define a fake set of authz parameters to be verified
const shareParams = {
  authz: clientAuthzId,
  ctx: 'mock-ctx',
  dataKey: 'mock-key',
  key: shareId,
  user: 'mock-user',
};

// Define the data object we expect to pass into authz rest call
const expectedRestParams = {
  ctx: 'mock-ctx',
  key: 'mock-key',
  owner: 'mock-user',
  requestor,
};

describe('authz', () => {
  before(() => {
    restStub = sinon.stub(rest, 'get');
    authzStub = sinon.stub(dbAuthz, 'info');
  });

  after(() => {
    rest.get.restore();
    authzStub.restore();
  });

  it('should return true that a built in verifier exists', async () => {
    try {
      const result = await authz.exists.call(mockCtx, 'uds_authz_deny');
      expect(result).to.equal(true);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject();
    }
  });

  it('should throw if a verifier does not exist', async () => {
    authzStub.callsFake(params => {
      expect(params).to.deep.equal({ name: clientAuthzId });
      throw errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
    });

    try {
      await authz.exists.call(mockCtx, clientAuthzId);
      return Promise.reject();
    } catch (err) {
      expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND);
      return Promise.resolve();
    }
  });

  it('should always allow access when using simple allow verifier', async () => {
    try {
      await authz.verify.call(mockCtx, shareId, requestor, { authz: 'uds_authz_allow' });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject();
    }
  });

  it('should always deny access when using simple deny verifier', async () => {
    try {
      await authz.verify.call(mockCtx, shareId, requestor, { authz: 'uds_authz_deny' });
      return Promise.reject();
    } catch (err) {
      expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
      return Promise.resolve();
    }
  });

  it('should look up authz method and allow access when valid', async () => {
    authzStub.callsFake(params => {
      expect(params).to.deep.equal({ name: clientAuthzId });
      return mockAuthzResult;
    });

    restStub.callsFake((url, params) => {
      expect(url).to.equal(clientAuthzUrl);
      expect(params).to.deep.equal(expectedRestParams);
      return undefined;
    });

    try {
      await authz.verify.call(mockCtx, shareId, requestor, shareParams);
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve();
  });

  it('should look up authz method and allow access when valid using a consistent read', async () => {
    authzStub.callsFake(params => {
      expect(params).to.deep.equal({ name: clientAuthzId });
      return mockAuthzResult;
    });

    restStub.callsFake((url, params) => {
      expect(url).to.equal(clientAuthzUrl);
      expect(params).to.deep.equal(expectedRestParams);
      return undefined;
    });

    try {
      mockCtx.database.consistentRead = true;
      await authz.verify.call(mockCtx, shareId, requestor, shareParams);
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve();
  });
});
