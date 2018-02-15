import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We import authz before we set the DocumentClient stub because
//  authz uses lazy initialization. See details within authz.js
import authz from '../../../../app/db/authz';
import dynamoDBClient from '../../../../app/db/dynamoDBClient';

import errors from '../../../../app/models/errors';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(
  AWS.DynamoDB.DocumentClient,
);

const name = 'unittest.authz.authzname';
const url = 'http://localhost:5200/authz';
const swatchCtx = {
  database: {
    consistentRead: true,
  },
};

describe('authz', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
  });

  after(() => {
    dynamoDBClient.instrumented.restore();
  });

  describe('register', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await authz.register.apply(swatchCtx, [{ url }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "url" is not passed in the params', async () => {
      try {
        await authz.register.apply(swatchCtx, [{ name }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls throws an error if there is an existing authz configuration with that name', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({ name, url });
        expect(params).to.have.all.keys(
          'Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression',
        );

        // Pretend the condition expression failed.
        throw new Error('The conditional request failed');
      });

      try {
        await authz.register.apply(swatchCtx, [{ name, url }]);
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_NAME_IN_USE);
        return Promise.resolve();
      }

      return Promise.reject(new Error('This test failed because we expected the register call to throw an error.'));
    });

    it('succeeds in the happy case', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({ name, url });
        expect(params).to.have.all.keys(
          'Item', 'TableName', 'ExpressionAttributeNames', 'ConditionExpression',
        );

        return {
          promise: () => (Promise.resolve({})),
        };
      });

      try {
        await authz.register.apply(swatchCtx, [{ name, url }]);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });
  });

  describe('remove', () => {
    it('throws an error if "name" is not passed in the params', async () => {
      try {
        await authz.remove.apply(swatchCtx, [{}]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('succeeds in the happy case', async () => {
      documentClientStub.delete.callsFake(params => {
        expect(params.Key).to.deep.equal({ name });
        expect(params).to.have.all.keys('Key', 'TableName');

        return {
          promise: () => (Promise.resolve({})),
        };
      });

      try {
        await authz.remove.apply(swatchCtx, [{ name }]);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });
  });

  describe('list', () => {
    it('succeeds in the happy case', async () => {
      documentClientStub.scan.callsFake(params => {
        expect(params).to.have.all.keys('ConsistentRead', 'TableName');

        return {
          promise: () => (Promise.resolve({
            Items: ['a', 'b', 'c'],
          })),
        };
      });

      try {
        const list = await authz.list.apply(swatchCtx);
        expect(list).to.deep.equal(['a', 'b', 'c']);
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });

    it('paginates appropriately if there are many authz configurations', async () => {
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
        const list = await authz.list.apply(swatchCtx);
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
        await authz.info.apply(swatchCtx, [{}]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('returns an app if it exists', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params).to.have.all.keys('ConsistentRead', 'TableName', 'Key');
        expect(params.Key).to.deep.equal({
          name,
        });

        return {
          promise: () => (Promise.resolve({
            Item: { name, url },
          })),
        };
      });

      try {
        const info = await authz.info.apply(swatchCtx, [{ name }]);
        expect(info).to.deep.equal({ name, url });
      } catch (err) {
        return Promise.reject(err);
      }

      return Promise.resolve();
    });

    it('throws an error if an app does not exist', async () => {
      documentClientStub.get.callsFake(params => {
        expect(params).to.have.property('TableName');

        expect(params).to.have.all.keys('ConsistentRead', 'TableName', 'Key');
        expect(params.Key).to.deep.equal({ name });

        return {
          promise: () => (Promise.resolve({
            Item: undefined,
          })),
        };
      });

      try {
        await authz.info.apply(swatchCtx, [{ name }]);
      } catch (err) {
        expect(err).to.deep.equal(errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND);
        return Promise.resolve();
      }

      return Promise.reject(new Error('Test should have thrown an error earlier.'));
    });
  });
});
