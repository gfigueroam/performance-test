import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We can import calculatedBehavior before we set the DocumentClient stub
// because calculatedBehavior uses lazy initialization. See details within
// calculatedBehavior.js
import calculatedBehavior from '../../../../app/db/calculatedBehavior';

import errors from '../../../../app/models/errors';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);

sinon.stub(AWS.DynamoDB, 'DocumentClient').callsFake((params) => {
  expect(params).to.have.all.keys('apiVersion', 'region', 'endpoint');
  return documentClientStub;
});
//
// sinon.stub(AWS.STS, 'DocumentClient').callsFake((params) => {
//   expect(params).to.have.all.keys('apiVersion');
//   return {
//     assumeRole: () => {
//       return {
//         promise: () => {
//           Promise.resolve({
//             Credentials: {
//               AccessKeyId: 'dummyAccessKeyId',
//               SecretAccessKey: 'dummySecretAccessKey',
//               SessionToken: 'dummySessionToken',
//             },
//           });
//         }
//       };
//     }
//   };
// });

const user = 'unittest.calculatedBehavior.user';
const key = 'unittest.calculatedBehavior.key';

describe('calculatedBehavior', () => {
  after(() => {
    AWS.DynamoDB.DocumentClient.restore();
    // AWS.STS.restore();
  });

  describe('atomicUpdate', () => {
    it('throws an error if "user" is not passed in the params', async () => {
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
          user,
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
          user,
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
          user,
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
          user,
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
          user,
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
          user,
        });

        expect(params.ExpressionAttributeValues[':value']).to.equal(1);

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate({
        key,
        user,
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
          user,
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
          user,
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.atomicUpdate({
        key,
        user,
        value: 1,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('set', () => {
    it('throws an error if "user" is not passed in the params', async () => {
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
          user,
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
          user,
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
          user,
        });
        expect(params).to.have.all.keys('Item', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.set({
        data,
        key,
        user,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('get', () => {
    it('throws an error if "user" is not passed in the params', async () => {
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
          user,
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
          user,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      calculatedBehavior.get({
        key,
        user,
      })
      .then(done)
      .catch(done);
    });
  });
});
