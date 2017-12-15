import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We can import apps before we set the DocumentClient stub
// because apps uses lazy initialization. See details within
// apps.js
import apps from '../../../../app/db/apps';
import dynamoDBClient from '../../../../app/db/dynamoDBClient';

import errors from '../../../../app/models/errors';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);

const name = 'unittest.apps.appname';
const quota = 1024;

describe('apps', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'getClient').callsFake(() => (documentClientStub));
  });

  after(() => {
    dynamoDBClient.getClient.restore();
  });

  describe('register', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await apps.register({
          quota,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "quota" is not passed in the params', async () => {
      try {
        await apps.register({
          name,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls throws an error if there is an existing app with that name', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({
          name,
          quota,
        });
        expect(params).to.have.all.keys('Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression');

        // Pretend the condition expression failed.
        throw new Error('The conditional request failed');
      });

      try {
        await apps.register({
          name,
          quota,
        });
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_NAME_IN_USE);
        return Promise.resolve();
      }

      return Promise.reject(new Error('This test failed because we expected the register call to throw an error.'));
    });

    it('succeeds in the happy case', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({
          name,
          quota,
        });
        expect(params).to.have.all.keys('Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression');

        return {
          promise: () => (Promise.resolve({})),
        };
      });

      try {
        await apps.register({
          name,
          quota,
        });
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });
  });

  describe('remove', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await apps.remove({});
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('succeeds in the happy case', async () => {
      documentClientStub.delete.callsFake(params => {
        expect(params.Key).to.deep.equal({
          name,
        });
        expect(params).to.have.all.keys('Key', 'TableName');

        return {
          promise: () => (Promise.resolve({})),
        };
      });

      try {
        await apps.remove({
          name,
          quota,
        });
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });
  });

  describe('list', () => {
    it('succeeds in the happy case', async () => {
      documentClientStub.scan.callsFake(params => {
        expect(params).to.have.all.keys('TableName');

        return {
          promise: () => (Promise.resolve({
            Items: ['a', 'b', 'c'],
          })),
        };
      });

      try {
        const list = await apps.list();
        expect(list).to.deep.equal(['a', 'b', 'c']);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });

    it('paginates appropriately if there are many apps', async () => {
      documentClientStub.scan.callsFake(params => {
        expect(params).to.have.property('TableName');

        if (params.ExclusiveStartKey) {
          expect(params.ExclusiveStartKey).to.equal('lastKey');
          return {
            promise: () => (Promise.resolve({
              Items: ['a', 'b', 'c'],
            })),
          };
        }
        return {
          promise: () => (Promise.resolve({
            Items: ['d', 'e', 'f'],
            LastEvaluatedKey: 'lastKey',
          })),
        };
      });

      try {
        const list = await apps.list();
        // We don't care about order.
        expect(list).to.have.members(['a', 'b', 'c', 'd', 'e', 'f']);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });
  });

  describe('info', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await apps.info({});
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('returns an app if it exists', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params).to.have.all.keys('TableName', 'Key');
        expect(params.Key).to.deep.equal({
          name,
        });

        return {
          promise: () => (Promise.resolve({
            Item: {
              name,
              quota,
            },
          })),
        };
      });

      try {
        const info = await apps.info({
          name,
        });
        expect(info).to.deep.equal({
          name,
          quota,
        });
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });

    it('throws an error if an app does not exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params).to.have.property('TableName');

        expect(params).to.have.all.keys('TableName', 'Key');
        expect(params.Key).to.deep.equal({
          name,
        });

        return {
          promise: () => (Promise.resolve({
            Item: undefined,
          })),
        };
      });

      try {
        await apps.info({
          name,
        });
      } catch (err) {
        expect(err).to.deep.equal(errors.codes.ERROR_CODE_APP_NOT_FOUND);
        return Promise.resolve();
      }

      return Promise.reject(new Error('Test should have thrown an error earlier.'));
    });
  });

  describe('setQuota', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await apps.setQuota({
          quota,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "quota" is not passed in the params', async () => {
      try {
        await apps.setQuota({
          name,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('sets the quota correctly', async () => {
      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys('Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression');
        expect(params.Item).to.deep.equal({
          name,
          quota,
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });

      try {
        const result = await apps.setQuota({
          name,
          quota,
        });
        expect(result).to.equal(undefined);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });

    it('throws an error if an app does not exist', async () => {
      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys('Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression');
        expect(params.Item).to.deep.equal({
          name,
          quota,
        });
        expect(params.ConditionExpression).to.equal('attribute_exists(#name)');

        // App not found in DynamoDB due to the condition expression.
        throw new Error('The conditional request failed');
      });

      try {
        await apps.setQuota({
          name,
          quota,
        });
      } catch (err) {
        expect(err).to.deep.equal(errors.codes.ERROR_CODE_APP_NOT_FOUND);
        return Promise.resolve();
      }

      return Promise.reject(new Error('Test should have thrown an error earlier.'));
    });
  });
});