import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../app/authz';
import config from '../../../../app/config';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

import dynamoDBClient from '../../../../app/db/dynamoDBClient';

const expect = chai.expect;

let restStub;
const documentClientStub = sinon.createStubInstance(
  AWS.DynamoDB.DocumentClient,
);

const mockCtx = {
  logger,
};

const shareId = 'testshareid1';

const authzTableName = config.get('database').authzTableName;

describe('authz', () => {
  before(() => {
    restStub = sinon.stub(rest, 'get');
    sinon.stub(dynamoDBClient, 'getClient').callsFake(() => (documentClientStub));
  });

  after(() => {
    rest.get.restore();
    dynamoDBClient.getClient.restore();
  });

  it('should always allow access when using simple allow verifier', async () => {
    try {
      await authz.verify.call(mockCtx, 'uds_authz_allow', shareId);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject();
    }
  });

  it('should throw if authorization header is in an invalid format', async () => {
    try {
      await authz.verify.call(mockCtx, 'uds_authz_deny', shareId);
      return Promise.reject();
    } catch (err) {
      expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
      return Promise.resolve();
    }
  });

  it('should look up authz method and allow access when valid', async () => {
    const clientAuthzId = 'some-client-authz-id;';
    const clientAuthzUrl = 'https://test-client.hmhco.com/authz';

    const mockAuthzResult = {
      name: clientAuthzId,
      url: clientAuthzUrl,
    };

    documentClientStub.get.callsFake(params => {
      expect(params).to.have.all.keys('TableName', 'Key');
      expect(params.TableName).to.equal(authzTableName);
      expect(params.Key).to.deep.equal({ name: clientAuthzId });

      return {
        promise: () => (Promise.resolve({
          Item: mockAuthzResult,
        })),
      };
    });

    restStub.callsFake((url, params) => {
      expect(url).to.equal(clientAuthzUrl);
      expect(params).to.deep.equal({
        ctx: 'mock-ctx',
        key: 'mock-key',
        user_id: 'mock-user',
      });
      return undefined;
    });

    try {
      await authz.verify.call(mockCtx, clientAuthzId, shareId);
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve();
  });
});
