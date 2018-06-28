import chai from 'chai';
import sinon from 'sinon';

import auth from '../../../../app/auth';
import config from '../../../../app/config';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import share from '../../../../app/db/share';

import authz from '../../../../app/authz';
import dynamoDBClient from '../../../../app/db/client';
import userDB from '../../../../app/db/userData';

const expect = chai.expect;

const shareTableName = config.get('database').shareTableName;
const appDataTableName = config.get('database').appDataJsonTableName;

const requestor = 'some-user-requestor';
const testShareId = '12341234-1234-1234-1234-123412341234';

const swatchCtx = {
  database: {
    consistentRead: true,
  },
  logger,
};

const documentClientStub = {
  delete: sinon.stub(),
  get: sinon.stub(),
  put: sinon.stub(),
};


describe('db.share', () => {
  before(() => {
    sinon.stub(authz, 'exists');
    sinon.stub(userDB, 'get');

    sinon.stub(auth.ids, 'hasAccessTo').returns(true);
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
  });

  after(() => {
    authz.exists.restore();
    userDB.get.restore();

    auth.ids.hasAccessTo.restore();
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

    it('returns undefined when the share id doesnt exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params.TableName).to.equal(shareTableName);
        expect(params.Key.key).to.equal(testShareId);
        return { promise: () => (Promise.resolve({})) };
      });

      try {
        const result = await share.getShared.apply(swatchCtx, [{
          id: testShareId,
          requestor,
        }]);
        expect(result).to.equal(undefined);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
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
        await share.getShared.apply(swatchCtx, [{
          id: testShareId,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED);
        return Promise.resolve();
      }
    });

    it('returns undefined with content key is not found', async () => {
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
        const result = await share.getShared.apply(swatchCtx, [{
          id: testShareId,
          requestor,
        }]);
        expect(result).to.equal(undefined);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
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
                type: 'text',
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
                type: 'text',
              },
            })),
          };
        });

      try {
        const result = await share.getShared.apply(swatchCtx, [{
          id: testShareId,
          requestor,
        }]);
        expect(result).to.deep.equal({
          data: 'mock-data',
          key: 'mock-key',
          type: 'text',
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
      auth.ids.hasAccessTo.returns(false);

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
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('should throw an error if the authz does not exist', async () => {
      auth.ids.hasAccessTo.returns(true);

      // Mock the case where the authz name does not exist
      authz.exists.callsFake(() => {
        throw errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
      });
      userDB.get.callsFake(() => ({ key: 'key-whatever' }));

      try {
        await share.share.apply(swatchCtx, [{
          authz: 'authz-whatever',
          ctx: 'ctx-whatever',
          key: 'key-whatever',
          requestor: 'owner-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND);
        return Promise.resolve();
      }
    });

    it('should throw an error if the key is not found', async () => {
      // Mock the case where the data key does not exist
      authz.exists.callsFake(() => (true));
      userDB.get.callsFake(() => (undefined));

      try {
        await share.share.apply(swatchCtx, [{
          authz: 'authz-whatever',
          ctx: 'ctx-whatever',
          key: 'key-whatever',
          requestor: 'owner-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_KEY_NOT_FOUND);
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

      authz.exists.callsFake(params => {
        expect(params).to.deep.equal('authz-whatever');
        return true;
      });

      userDB.get.callsFake(params => {
        expect(params).to.deep.equal({
          key: 'key-whatever',
          owner: 'owner-id',
          requestor: 'owner-id',
        });
        return { key: 'key-whatever' };
      });

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
      auth.ids.hasAccessTo.returns(false);

      try {
        await share.unshare.apply(swatchCtx, [{
          id: 'id-whatever',
          owner: 'owner-id',
          requestor: 'requestor-id',
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('throws an error when the share id doesnt exist', async () => {
      auth.ids.hasAccessTo.returns(true);

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
        expect(err).to.equal(errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND);
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
