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

  const db = new AWS.DynamoDB(dynamoDbParams);

  // Call DynamoDB to delete all the tables
  await Promise.all([
    nconf.get('database').calculatedBehaviorTableName,
    nconf.get('database').appsTableName,
    nconf.get('database').appDataJsonTableName,
    nconf.get('database').authzTableName,
  ].map(async (dynamoDBTableName) => {
    try {
      const data = await db.deleteTable({
        TableName: dynamoDBTableName,
      }).promise();
      // eslint-disable-next-line no-console
      console.log(`Success deleting ${dynamoDBTableName} table`, data);
    } catch (err) {
      if (err.code === 'ResourceNotFoundException') {
        // eslint-disable-next-line no-console
        console.error(`Error deleting ${dynamoDBTableName}: Table not found`, err);
      } else if (err.code === 'ResourceInUseException') {
        // eslint-disable-next-line no-console
        console.error(`Error deleting ${dynamoDBTableName}: Table in use`, err);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Error deleting ${dynamoDBTableName}`, err);
      }
    }
  }));
}

execute();
