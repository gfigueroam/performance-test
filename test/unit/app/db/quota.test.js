import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';
import sizeof from 'object-sizeof';

import auth from '../../../../app/auth';
import quota from '../../../../app/db/quota';
import dynamoDBClient from '../../../../app/db/client';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);

const requestor = 'unittest.userData.user';
const app = 'unittestapp';
const swatchCtx = {
  database: {
    consistentRead: true,
  },
};

describe('quota', () => {
  before(() => {
    sinon.stub(auth.ids, 'hasAccessTo').returns(true);
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
  });

  after(() => {
    auth.ids.hasAccessTo.restore();
    dynamoDBClient.instrumented.restore();
  });

  describe('getConsumedQuota', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await quota.getConsumedQuota.apply(swatchCtx, [{
          app,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await quota.getConsumedQuota.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamodb query to get items and returns their sizeof as the consumed quota', async () => {
      const Items = [{
        a: true,
        b: false,
      }, {
        c: true,
        d: false,
      }];
      documentClientStub.query.callsFake(params => {
        expect(params).to.have.all.keys(
          'ConsistentRead',
          'ExpressionAttributeNames',
          'KeyConditionExpression',
          'ExpressionAttributeValues',
          'ReturnConsumedCapacity',
          'Select',
          'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            ConsumedCapacity: {
              CapacityUnits: 25,
            },
            Items,
          })),
        };
      });

      const consumed = await quota.getConsumedQuota.apply(swatchCtx, [{
        app,
        requestor,
      }]);
      expect(consumed).to.equal(sizeof(Items));
    });

    it('paginates calls to DynamoDB.query', async () => {
      documentClientStub.query.reset(); // Reset past call history
      const Items = [{
        a: true,
        b: false,
      }, {
        c: true,
        d: false,
      }];
      documentClientStub.query.onCall(0).returns({
        promise: () => (Promise.resolve({
          ConsumedCapacity: {
            CapacityUnits: 25,
          },
          Items,
          LastEvaluatedKey: 'someExclusiveStartKey',
        })),
      });

      documentClientStub.query.onCall(1).returns({
        promise: () => (Promise.resolve({
          ConsumedCapacity: {
            CapacityUnits: 25,
          },
          Items,
        })),
      });

      const consumed = await quota.getConsumedQuota.apply(swatchCtx, [{
        app,
        requestor,
      }]);
      expect(consumed).to.equal(2 * sizeof(Items));
    });
  });
});
