import AWS from 'aws-sdk';

import nconf from '../../app/config';

async function execute() {
  const dynamoDbParams = {
    apiVersion: nconf.get('database').apiVersion,
    endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
    region: nconf.get('database').region,
  };

  if (nconf.get('database').credentials) {
    dynamoDbParams.accessKeyId = nconf.get('database').credentials.accessKeyId;
    dynamoDbParams.secretAccessKey = nconf.get('database').credentials.secretAccessKey;
  }

  const db = new AWS.DynamoDB.DocumentClient(dynamoDbParams);

  // Call DynamoDB to list all tables in local instance
  try {
    const data = await db.scan({
      TableName: nconf.get('database').calculatedBehaviorTableName,
    }).promise();
    // eslint-disable-next-line no-console
    console.log('Items: ', data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error', err.code);
  }
}

execute();
