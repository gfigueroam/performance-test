import chai from 'chai';
import sinon from 'sinon';

import AWS from 'aws-sdk';

import dynamo from '../../../../../app/db/client/dynamo';

const expect = chai.expect;


describe('db.instrumented', () => {
  it('should initialize a Dynamo client with params', async () => {
    sinon.stub(AWS, 'Endpoint').callsFake(endpoint => {
      expect(endpoint).to.equal('none');
      return endpoint;
    });

    sinon.stub(AWS.DynamoDB, 'DocumentClient').callsFake(params => {
      expect(params).to.deep.equal({
        accessKeyId: 'testAccessKey',
        apiVersion: '2012-08-10',
        endpoint: {},
        region: 'us-east-1',
        secretAccessKey: 'testSecretAccessKey',
      });
      return { mock: 'db' };
    });

    const client = await dynamo.getClient();
    expect(client).to.deep.equal({ mock: 'db' });

    AWS.Endpoint.restore();
    AWS.DynamoDB.DocumentClient.restore();
  });
});
