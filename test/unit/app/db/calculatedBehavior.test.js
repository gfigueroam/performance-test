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

const user = 'unittest.calculatedBehavior.user';
const key = 'unittest.calculatedBehavior.key';

describe('calculatedBehavior', () => {
  after(() => {
    AWS.DynamoDB.DocumentClient.restore();
  });

  describe('set', () => {
    it('throws an error if "user" is not passed in the params', () => {
      expect(() => {
        calculatedBehavior.set({
          data: true,
          key,
        });
      }).to.throw();
    });

    it('throws an error if "key" is not passed in the params', () => {
      expect(() => {
        calculatedBehavior.set({
          data: true,
          user,
        });
      }).to.throw();
    });

    it('throws an error if "data" is not passed in the params', () => {
      expect(() => {
        calculatedBehavior.set({
          key,
          user,
        });
      }).to.throw();
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
        done();
      });
      calculatedBehavior.set({
        data,
        key,
        user,
      });
    });
  });

  describe('get', () => {
    it('throws an error if "user" is not passed in the params', () => {
      expect(() => {
        calculatedBehavior.get({
          key,
        });
      }).to.throw();
    });

    it('throws an error if "key" is not passed in the params', () => {
      expect(() => {
        calculatedBehavior.get({
          user,
        });
      }).to.throw();
    });

    it('calls dynamoDB.get and returns a promisified version', (done) => {
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          key,
          user,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        done();
      });
      calculatedBehavior.get({
        key,
        user,
      });
    });
  });
});
