import chai from 'chai';
import sinon from 'sinon';

// We can import calculatedBehavior before we set the DocumentClient stub
// because calculatedBehavior uses lazy initialization. See details within
// calculatedBehavior.js
import calculatedBehavior from '../../../../app/db/calculatedBehavior';
import dynamoDBClient from '../../../../app/db/client';

import auth from '../../../../app/auth';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';

const expect = chai.expect;

const requestor = 'unittest.calculatedBehavior.user';
const key = 'unittest.calculatedBehavior.key';
const keyPrefix = 'unittest.calculatedBehavior.keyPrefix';
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
  query: sinon.stub(),
  update: sinon.stub(),
};


describe('db.calculatedBehavior', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
    sinon.stub(auth.ids, 'hasAccessTo').returns(true);
  });

  after(() => {
    auth.ids.hasAccessTo.restore();
    dynamoDBClient.instrumented.restore();
  });

  describe('merge', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          data: {},
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          data: {},
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          key,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls throws an error if there is an existing non-object value', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(() => ({
        promise: () => (Promise.resolve({
          Item: {
            data: true,
          },
        })),
      }));

      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          data: {},
          key,
          requestor,
        }]);
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
        return Promise.resolve();
      }

      return Promise.reject(new Error('This test failed because we expected the merge call to throw an error.'));
    });

    it('calls dynamoDB.put if there is no existing value', async () => {
      const data = {
        someKey: 'some value',
      };
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys(
          'ConsistentRead', 'Key', 'ReturnConsumedCapacity', 'TableName',
        );
        return {
          promise: () => (Promise.resolve({})),
        };
      });

      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys('ConditionExpression',
          'ExpressionAttributeNames', 'Item', 'ReturnConsumedCapacity', 'TableName');

        expect(params.Item).to.deep.equal({
          createdBy: requestor,
          data,
          key,
          user: requestor,
        });

        expect(params.ConditionExpression).to.equal('attribute_not_exists(#data)');
        expect(params.ExpressionAttributeNames['#data']).to.equal('data');

        return {
          promise: () => (Promise.resolve()),
        };
      });

      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          data,
          key,
          requestor,
        }]);

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    });

    it('calls dynamoDB.update if there is an existing object value', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys(
          'ConsistentRead', 'Key', 'ReturnConsumedCapacity', 'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: {
                anotherKey: 'anotherValue',
                someKey: 'someValue',
              },
            },
          })),
        };
      });

      documentClientStub.update.callsFake(params => {
        expect(params).to.have.all.keys('ConditionExpression',
          'ExpressionAttributeNames', 'ExpressionAttributeValues',
          'Key', 'ReturnConsumedCapacity', 'TableName', 'UpdateExpression');

        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });

        expect(params.ExpressionAttributeValues[':value']).to.deep.equal({
          anotherKey: 'anotherValue',
          someKey: 'replacementValue',
        });

        expect(params.ExpressionAttributeValues[':oldval']).to.deep.equal({
          anotherKey: 'anotherValue',
          someKey: 'someValue',
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });

      try {
        await calculatedBehavior.merge.apply(swatchCtx, [{
          data: {
            someKey: 'replacementValue',
          },
          key,
          requestor,
        }]);

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    });
  });

  describe('atomicUpdate', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
          key,
          value: 1,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
          requestor,
          value: 1,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "value" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
          key,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if there is an existing non-numeric value', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(() => ({
        promise: () => (Promise.resolve({
          Item: {
            data: true,
          },
        })),
      }));

      try {
        await calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
          key,
          requestor,
          value: 1,
        }]);
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
        return Promise.resolve();
      }

      return Promise.reject(new Error('This test failed because we expected the atomicUpdate call to throw an error.'));
    });

    it('calls dynamoDB.update if there is an existing numeric value', (done) => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('ConsistentRead', 'Key', 'ReturnConsumedCapacity', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: 10,
            },
          })),
        };
      });

      documentClientStub.update.callsFake(params => {
        expect(params).to.have.all.keys(
          'ConditionExpression',
          'ExpressionAttributeNames',
          'ExpressionAttributeValues',
          'Key',
          'ReturnConsumedCapacity',
          'TableName',
          'UpdateExpression',
        );
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params.ExpressionAttributeValues[':value']).to.equal(1);

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
        key,
        requestor,
        value: 1,
      }])
      .then(done)
      .catch(done);
    });

    it('calls dynamoDB.put if there is no existing value', (done) => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys(
          'ConsistentRead',
          'Key',
          'ReturnConsumedCapacity',
          'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            Item: undefined,
          })),
        };
      });

      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys(
          'ConditionExpression',
          'ExpressionAttributeNames',
          'Item',
          'ReturnConsumedCapacity',
          'TableName',
        );
        expect(params.Item).to.deep.equal({
          createdBy: requestor,
          data: 1,
          key,
          user: requestor,
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
        key,
        requestor,
        value: 1,
      }])
      .then(done)
      .catch(done);
    });

    it('calls dynamoDB.put if there is no existing value but falls back to dynamoDB.update', (done) => {
      // dynamodb.get is called to check the existing value
      let getCalls = 0;
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys(
          'ConsistentRead',
          'Key',
          'ReturnConsumedCapacity',
          'TableName',
        );
        // Return an item on the second call
        if (getCalls === 0) {
          getCalls += 1;
          return {
            promise: () => (Promise.resolve({
              Item: undefined,
            })),
          };
        }
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: 10,
            },
          })),
        };
      });

      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys(
          'ConditionExpression',
          'ExpressionAttributeNames',
          'Item',
          'ReturnConsumedCapacity',
          'TableName',
        );
        expect(params.Item).to.deep.equal({
          createdBy: requestor,
          data: 1,
          key,
          user: requestor,
        });

        return {
          promise: () => (Promise.reject(new Error('Fake error'))),
        };
      });

      documentClientStub.update.callsFake(params => {
        expect(params).to.have.all.keys(
          'ConditionExpression',
          'ExpressionAttributeNames',
          'ExpressionAttributeValues',
          'Key',
          'ReturnConsumedCapacity',
          'TableName',
          'UpdateExpression',
        );
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params.ExpressionAttributeValues[':value']).to.equal(1);

        return {
          promise: () => (Promise.resolve()),
        };
      });

      calculatedBehavior.atomicUpdate.apply(swatchCtx, [{
        key,
        requestor,
        value: 1,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('set', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set.apply(swatchCtx, [{
          data: true,
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set.apply(swatchCtx, [{
          data: true,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set.apply(swatchCtx, [{
          key,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.set and returns a promisified version', (done) => {
      const data = 'this is some data';
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({
          createdBy: requestor,
          data,
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('Item', 'ReturnConsumedCapacity', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.set.apply(swatchCtx, [{
        data,
        key,
        requestor,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('unset', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.unset.apply(swatchCtx, [{
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.unset.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.delete and returns a promisified version', (done) => {
      documentClientStub.delete.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('Key', 'ReturnConsumedCapacity', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.unset.apply(swatchCtx, [{
        key,
        requestor,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('get', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.get.apply(swatchCtx, [{
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.get.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.get and returns a promisified version', (done) => {
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('ConsistentRead', 'Key', 'ReturnConsumedCapacity', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.get.apply(swatchCtx, [{
        key,
        requestor,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('query', () => {
    it('throws an error if "keyPrefix" is not passed in the params', async () => {
      try {
        await calculatedBehavior.query.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.query.apply(swatchCtx, [{
          keyPrefix,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor does not match owner', async () => {
      auth.ids.hasAccessTo.returns(false);

      try {
        await calculatedBehavior.query.apply(swatchCtx, [{
          keyPrefix,
          owner: 'other-owner',
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.query and returns a promisified version', (done) => {
      auth.ids.hasAccessTo.returns(true);

      documentClientStub.query.callsFake(params => {
        expect(params.KeyConditions).to.deep.equal({
          key: {
            AttributeValueList: [keyPrefix],
            ComparisonOperator: 'BEGINS_WITH',
          },
          user: {
            AttributeValueList: [requestor],
            ComparisonOperator: 'EQ',
          },
        });
        expect(params).to.have.all.keys(
          'ConsistentRead', 'KeyConditions', 'ReturnConsumedCapacity', 'TableName',
        );
        return {
          promise: () => (Promise.resolve({ Items: [] })),
        };
      });
      calculatedBehavior.query.apply(swatchCtx, [{
        keyPrefix,
        requestor,
      }])
      .then((items) => {
        expect(items).to.deep.equal([]);
        done();
      })
      .catch(done);
    });

    it('calls dynamoDB.query and returns a list of paginated results', (done) => {
      const item1 = {
        data: {
          anotherKey: 'anotherValue',
          someKey: 'someValue',
        },
      };
      const item2 = {
        data: {
          anotherKey: 'someOtherValue',
        },
      };
      const expectedResult = [item1, item2];

      auth.ids.hasAccessTo.returns(true);

      documentClientStub.query.reset();
      documentClientStub.query.onCall(0).callsFake(params => {
        expect(params).to.have.all.keys(
          'ConsistentRead', 'KeyConditions', 'ReturnConsumedCapacity', 'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            Items: [item1],
            LastEvaluatedKey: 'someStartKey',
          })),
        };
      });
      documentClientStub.query.onCall(1).callsFake(params => {
        expect(params).to.have.all.keys(
          'ConsistentRead', 'ExclusiveStartKey', 'KeyConditions', 'ReturnConsumedCapacity', 'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            Items: [item2],
          })),
        };
      });

      calculatedBehavior.query.apply(swatchCtx, [{
        keyPrefix,
        requestor,
      }])
      .then((items) => {
        expect(items).to.deep.equal(expectedResult);
        done();
      })
      .catch(done);
    });
  });
});
