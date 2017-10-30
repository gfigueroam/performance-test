import AWS from 'aws-sdk';
import nconf from '../config';

let dynamodb;

function ensureDynamoDbDocumentClient() {
  // This forces lazy initialization of the dynamodb DocumentClient.
  // We need to do this to support unit testing, since in a unit test we
  // want to mock the DocumentClient constructor in the unit test before
  // the constructor is called below. Normally we could do the following in
  // the unit test file:
  //
  // sinon.stub(AWS.DynamoDB, 'DocumentClient');
  // const calculatedBehavior = require('../calculatedBehavior');
  //
  // The above works fine. However UDS uses babel, and we tend to use
  // import in favor of require, which makes the above look like:
  //
  // sinon.stub(AWS.DynamoDB, 'DocumentClient');
  // import calculatedBehavior from '../calculatedBehavior';
  //
  // The problem here is babel. It transpiles the ES6 import syntax into a
  // require, and in doing so, it places the require *above* the sinon.stub
  // call, so if we did not use this lazy initialization of the DocumentClient
  // we would end up calling the un-mocked constructor and life would be sad
  // for the author trying to write the unit test.
  //
  // We could also initialize a new DocumentClient({...}) in each call. A quick
  // test indicates the constructor call takes 0.07ms on average (measured
  // across 100,000 calls on a ~2011 Macbook Air). However, there's no reason
  // to pay the tax if we do not need to.

  if (!dynamodb) {
    const dynamoDbParams = {
      apiVersion: nconf.get('database').apiVersion,
      endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
      region: nconf.get('database').region,
    };

    // Usually credentials are implicitly granted by running on EC2. However
    // in some cases, like running locally on Docker, the AWS SDK requires
    // credentials (and if it can't find any, it complains with a "Could not
    // load credentials from any providers" error).
    if (nconf.get('database').credentials) {
      dynamoDbParams.accessKeyId = nconf.get('database').credentials.accessKeyId;
      dynamoDbParams.secretAccessKey = nconf.get('database').credentials.secretAccessKey;
    }

    dynamodb = new AWS.DynamoDB.DocumentClient(dynamoDbParams);
  }
}

function set(params) {
  ensureDynamoDbDocumentClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }

  /* eslint-disable sort-keys */
  return dynamodb.put({
    Item: {
      user: params.user,
      key: params.key,
      data: params.data,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  }).promise();
}

function get(params) {
  ensureDynamoDbDocumentClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }

  /* eslint-disable sort-keys */
  return dynamodb.get({
    Key: {
      user: params.user,
      key: params.key,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  }).promise();
}

module.exports = {
  get,
  set,
};
