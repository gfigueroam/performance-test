import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../app/authz';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

import dbAuthz from '../../../../app/db/authz';

const expect = chai.expect;

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
    sinon.stub(rest, 'get');
    sinon.stub(dbAuthz, 'info');
  });

  after(() => {
    rest.get.restore();
    dbAuthz.info.restore();
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
    dbAuthz.info.callsFake(params => {
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
    dbAuthz.info.callsFake(params => {
      expect(params).to.deep.equal({ name: clientAuthzId });
      return mockAuthzResult;
    });

    const mockBody = {};
    const mockResponse = { statusCode: 200 };
    rest.get.callsFake((url, params, transform) => {
      expect(url).to.equal(clientAuthzUrl);
      expect(params).to.deep.equal(expectedRestParams);
      expect(transform(mockBody, mockResponse)).to.deep.equal(mockBody);
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
    dbAuthz.info.callsFake(() => (mockAuthzResult));
    rest.get.callsFake(() => (undefined));

    try {
      mockCtx.database.consistentRead = true;
      await authz.verify.call(mockCtx, shareId, requestor, shareParams);
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve();
  });

  it('should look up authz method but deny access when response is valid', async () => {
    dbAuthz.info.callsFake(() => (mockAuthzResult));

    // Mock the case where rest call to authz endpoint returns nothing
    rest.get.callsFake(() => {
      throw new Error('401 Unauthorized');
    });

    try {
      await authz.verify.call(mockCtx, shareId, requestor, shareParams);
      return Promise.reject();
    } catch (err) {
      expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
      return Promise.resolve();
    }
  });

  it('should look up authz method but deny access for any non-200 response', async () => {
    dbAuthz.info.callsFake(() => (mockAuthzResult));

    const mockBody = {};
    const mockResponse = { statusCode: 301 };
    rest.get.callsFake((url, params, transform) => {
      expect(url).to.equal(clientAuthzUrl);
      expect(params).to.deep.equal(expectedRestParams);
      transform(mockBody, mockResponse); // Should throw exception
    });

    try {
      await authz.verify.call(mockCtx, shareId, requestor, shareParams);
      return Promise.reject();
    } catch (err) {
      expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
      return Promise.resolve();
    }
  });
});
