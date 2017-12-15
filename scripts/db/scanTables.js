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

  // Call DynamoDB to scan all items in each table
  await Promise.all([
    nconf.get('database').calculatedBehaviorTableName,
    nconf.get('database').appsTableName,
    nconf.get('database').appDataJsonTableName,
    nconf.get('database').appDataBlobTableName,
  ].map(async (dynamoDBTableName) => {
    try {
      const data = await db.scan({
        TableName: dynamoDBTableName,
      }).promise();
      // eslint-disable-next-line no-console
      console.log(`${dynamoDBTableName} Items: `, JSON.stringify(data));
      // TODO: Detect if pagination is present and warn user of incomplete results
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error scanning ${dynamoDBTableName}`, err.code);
    }
  }));
}

execute();