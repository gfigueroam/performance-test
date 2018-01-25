import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

import config from '../../../../app/config';
import dynamoDBClient from '../../../../app/db/dynamoDBClient';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import share from '../../../../app/db/share';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(
  AWS.DynamoDB.DocumentClient,
);

const shareTableName = config.get('database').shareTableName;
const appDataTableName = config.get('database').appDataJsonTableName;

const testShareId = '12341234-1234-1234-1234-123412341234';

const swatchCtx = {
  database: {
    consistentRead: true,
  },
  logger,
};


describe('share', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
  });

  after(() => {
    dynamoDBClient.instrumented.restore();
  });

  describe('getShared', () => {
    it('throws an error when id param is missing', async () => {
      try {
        await share.getShared.apply(swatchCtx, [{}]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when the share id doesnt exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return { promise: () => (Promise.resolve({})) };
      });

      try {
        await share.getShared.apply(swatchCtx, [{ id: testShareId }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND);
        return Promise.resolve();
      }
    });

    it('throws an error with the default access denied authz', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return {
          promise: () => (Promise.resolve({
            Item: {
              authz: 'uds_authz_deny',
              ctx: 'mock-ctx',
              dataKey: 'mock-key',
              key: testShareId,
              user: 'mock-user-id',
            },
          })),
        };
      });

      try {
        await share.getShared.apply(swatchCtx, [{ id: testShareId }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
        return Promise.resolve();
      }
    });

    it('throws an error with content key is not found', async () => {
      documentClientStub.get = sinon.stub()
        .onCall(0)
        .callsFake(params => {
          expect(params.TableName).to.equal(shareTableName);
          expect(params.Key.key).to.equal(testShareId);
          return {
            promise: () => (Promise.resolve({
              Item: {
                appUser: 'mock-appuser-id',
                authz: 'uds_authz_allow',
                ctx: 'mock-ctx',
                dataKey: 'mock-key',
                key: testShareId,
                user: 'mock-user-id',
              },
            })),
          };
        })
        .onCall(1)
        .callsFake(params => {
          expect(params.TableName).to.equal(appDataTableName);
          expect(params.Key.key).to.equal('mock-key');
          expect(params.Key.appUser).to.equal('mock-appuser-id');
          return {
            promise: () => (Promise.resolve({})),
          };
        });

      try {
        await share.getShared.apply(swatchCtx, [{ id: testShareId }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_KEY_NOT_FOUND);
        return Promise.resolve();
      }
    });

    it('successfully returns shared content', async () => {
      documentClientStub.get = sinon.stub()
        .onCall(0)
        .callsFake(params => {
          expect(params.TableName).to.equal(shareTableName);
          expect(params.Key.key).to.equal(testShareId);
          return {
            promise: () => (Promise.resolve({
              Item: {
                appUser: 'mock-appuser-id',
                authz: 'uds_authz_allow',
                ctx: 'mock-ctx',
                dataKey: 'mock-key',
                key: testShareId,
                user: 'mock-user-id',
              },
            })),
          };
        })
        .onCall(1)
        .callsFake(params => {
          expect(params.TableName).to.equal(appDataTableName);
          expect(params.Key.key).to.equal('mock-key');
          expect(params.Key.appUser).to.equal('mock-appuser-id');
          return {
            promise: () => (Promise.resolve({
              Item: {
                data: 'mock-data',
                key: 'mock-key',
              },
            })),
          };
        });

      try {
        const result = await share.getShared.apply(swatchCtx, [{ id: testShareId }]);
        expect(result).to.deep.equal({
          data: 'mock-data',
          key: 'mock-key',
        });
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
      }
    });
  });

  describe('share', () => {
    it('throws an error when key param is missing', async () => {
      try {
        await share.share.apply(swatchCtx, [{}]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when authz param is missing', async () => {
      try {
        await share.share.apply(swatchCtx, [{
          key: 'key-whatever',
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when ctx param is missing', async () => {
      try {
        await share.share.apply(swatchCtx, [{
          authz: 'authz-whatever',
          dataKey: 'key-whatever',
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor param is missing', async () => {
      try {
        await share.share.apply(swatchCtx, [{
          authz: 'authz-whatever',
          ctx: 'ctx-whatever',
          key: 'key-whatever',
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor does not match owner', async () => {
      try {
        await share.share.apply(swatchCtx, [{
          authz: 'authz-whatever',
          ctx: 'ctx-whatever',
          dataKey: 'key-whatever',
          key: testShareId,
          owner: 'owner-id',
          requestor: 'requestor-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('should add a new share record after validating params', async () => {
      const shareParams = {
        authz: 'authz-whatever',
        ctx: 'ctx-whatever',
        key: 'key-whatever',
        requestor: 'owner-id',
      };

      let shareId;
      documentClientStub.put.callsFake(params => {
        shareId = params.Item.key;

        expect(params.TableName).to.equal(shareTableName);
        expect(params.Item.appKey).to.equal(`hmh*-*${shareParams.key}`);
        expect(params.Item.appUser).to.equal(`hmh*-*${shareParams.requestor}`);
        expect(params.Item.authz).to.equal(shareParams.authz);
        expect(params.Item.ctx).to.equal(shareParams.ctx);
        expect(params.Item.dataKey).to.equal(shareParams.key);
        expect(params.Item.user).to.equal(shareParams.requestor);

        return {
          promise: () => (Promise.resolve(shareId)),
        };
      });

      try {
        const result = await share.share.apply(swatchCtx, [shareParams]);
        expect(shareId).to.equal(result);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
      }
    });
  });

  describe('unshare', () => {
    it('throws an error when id param is missing', async () => {
      try {
        await share.unshare.apply(swatchCtx, [{}]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor param is missing', async () => {
      try {
        await share.unshare.apply(swatchCtx, [{ id: 'id-whatever' }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor does not match owner', async () => {
      try {
        await share.unshare.apply(swatchCtx, [{
          id: 'id-whatever',
          owner: 'owner-id',
          requestor: 'requestor-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('throws an error when the share id doesnt exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return { promise: () => (Promise.resolve({})) };
      });

      try {
        await share.unshare.apply(swatchCtx, [{
          id: testShareId,
          requestor: 'owner-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND);
        return Promise.resolve();
      }
    });

    it('throws an error when the share id doesnt exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return {
          promise: () => (Promise.resolve({
            Item: {
              key: testShareId,
            },
          })),
        };
      });

      documentClientStub.delete.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return {
          promise: () => (Promise.resolve({})),
        };
      });

      try {
        await share.unshare.apply(swatchCtx, [{
          id: testShareId,
          requestor: 'owner-id',
        }]);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
      }
    });
  });
});
