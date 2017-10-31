import AWS from 'aws-sdk';
import nconf from '../config';
import logger from '../monitoring/logger';

let dynamodb;

async function ensureDynamoDbDocumentClient() {
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
  //
  // Another reason to do this! STS Temporary security credentials are valid
  // for at most an hour.
  // Per http://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html
  //
  // The temporary security credentials are valid for the duration that you
  // specified when calling AssumeRole, which can be from 900 seconds (15 minutes)
  // to a maximum of 3600 seconds (1 hour). The default is 1 hour.

  if (!dynamodb) {
    const dynamoDbParams = {
      apiVersion: nconf.get('database').apiVersion,
      region: nconf.get('database').region,
    };

    // If iamRole is specified in the config, it needs to be assumed prior to
    // DynamoDB access.
    if (nconf.get('iamRole')) {
      const stsParams = {
        DurationSeconds: 3600,
        RoleArn: nconf.get('iamRole'),
        RoleSessionName: 'uds-dynamodb',
      };

      const sts = new AWS.STS({ apiVersion: '2011-06-15' });
      try {
        const assumedData = await sts.assumeRole(stsParams).promise();
        dynamoDbParams.accessKeyId = assumedData.Credentials.AccessKeyId;
        dynamoDbParams.secretAccessKey = assumedData.Credentials.SecretAccessKey;
        dynamoDbParams.sessionToken = assumedData.Credentials.SessionToken;

        // TODO: Set up some sort of credential refresh mechanism. It could be a setTimeout,
        // but need to ensure the service shuts down cleanly.
      } catch (err) {
        logger.error(`Unable to assume IAM role with STS Params ${stsParams}`, err);
        throw err;
      }
    }

    // Apply the endpoint if one is specified. (Otherwise it is built from the
    // region automatically).
    if (nconf.get('database').endpoint) {
      dynamoDbParams.endpoint = new AWS.Endpoint(nconf.get('database').endpoint);
    }

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

async function set(params) {
  await ensureDynamoDbDocumentClient();

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

async function get(params) {
  await ensureDynamoDbDocumentClient();

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
