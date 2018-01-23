import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We can import calculatedBehavior before we set the DocumentClient stub
// because calculatedBehavior uses lazy initialization. See details within
// calculatedBehavior.js
import calculatedBehavior from '../../../../app/db/calculatedBehavior';
import dynamoDBClient from '../../../../app/db/dynamoDBClient';

import errors from '../../../../app/models/errors';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);

const requestor = 'unittest.calculatedBehavior.user';
const key = 'unittest.calculatedBehavior.key';

describe('calculatedBehavior', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
  });

  after(() => {
    dynamoDBClient.instrumented.restore();
  });

  describe('merge', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge({
          data: {},
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge({
          data: {},
          requestor,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await calculatedBehavior.merge({
          key,
          requestor,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls throws an error if there is an existing non-object value', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: true,
            },
          })),
        };
      });

      try {
        await calculatedBehavior.merge({
          data: {},
          key,
          requestor,
        });
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
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
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({})),
        };
      });

      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys('ConditionExpression',
          'ExpressionAttributeNames', 'Item', 'TableName');

        expect(params.Item).to.deep.equal({
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
        await calculatedBehavior.merge({
          data,
          key,
          requestor,
        });

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
        expect(params).to.have.all.keys('Key', 'TableName');
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
          'Key', 'TableName', 'UpdateExpression');

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
        await calculatedBehavior.merge({
          data: {
            someKey: 'replacementValue',
          },
          key,
          requestor,
        });

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    });
  });

  describe('atomicUpdate', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate({
          key,
          value: 1,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate({
          requestor,
          value: 1,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "value" is not passed in the params', async () => {
      try {
        await calculatedBehavior.atomicUpdate({
          key,
          requestor,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls throws an error if there is an existing non-numeric value', async () => {
      // dynamodb.get is called to check the existing value
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: true,
            },
          })),
        };
      });

      try {
        await calculatedBehavior.atomicUpdate({
          key,
          requestor,
          value: 1,
        });
      } catch (err) {
        expect(err.message).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
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
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: {
              data: 10,
            },
          })),
        };
      });

      documentClientStub.update.callsFake(params => {
        expect(params).to.have.all.keys('ConditionExpression',
          'ExpressionAttributeNames', 'ExpressionAttributeValues',
          'Key', 'TableName', 'UpdateExpression');

        expect(params.Key).to.deep.equal({
          key,
          user: requestor,
        });

        expect(params.ExpressionAttributeValues[':value']).to.equal(1);

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate({
        key,
        requestor,
        value: 1,
      })
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
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: undefined,
          })),
        };
      });

      documentClientStub.put.callsFake(params => {
        expect(params).to.have.all.keys('ConditionExpression',
          'ExpressionAttributeNames',
          'Item', 'TableName');

        expect(params.Item).to.deep.equal({
          data: 1,
          key,
          user: requestor,
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate({
        key,
        requestor,
        value: 1,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('set', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set({
          data: true,
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set({
          data: true,
          requestor,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await calculatedBehavior.set({
          key,
          requestor,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.set and returns a promisified version', (done) => {
      const data = 'this is some data';
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({
          data,
          key,
          user: requestor,
        });
        expect(params).to.have.all.keys('Item', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.set({
        data,
        key,
        requestor,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('unset', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.unset({
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.unset({
          requestor,
        });
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
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.unset({
        key,
        requestor,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('get', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await calculatedBehavior.get({
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await calculatedBehavior.get({
          requestor,
        });
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
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.get({
        key,
        requestor,
      })
      .then(done)
      .catch(done);
    });
  });
});
