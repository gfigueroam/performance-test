import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We can import calculatedBehavior before we set the DocumentClient stub
// because calculatedBehavior uses lazy initialization. See details within
// calculatedBehavior.js
import calculatedBehavior from '../../../../app/db/calculatedBehavior';

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
