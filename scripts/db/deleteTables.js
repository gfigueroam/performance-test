import AWS from 'aws-sdk';
import nconf from '../../app/config';

async function execute() {
  const db = new AWS.DynamoDB({
    apiVersion: nconf.get('database').apiVersion,
    endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
    region: nconf.get('database').region,
  });

  // Call DynamoDB to delete the table for calculated behavior service
  try {
    const data = await db.deleteTable({
      TableName: nconf.get('database').calculatedBehaviorTableName,
    }).promise();
    // eslint-disable-next-line no-console
    console.log('Success deleting calculated-behavior table', data);
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') {
      // eslint-disable-next-line no-console
      console.error('Error deleting calculated-behavior: Table not found', err);
    } else if (err.code === 'ResourceInUseException') {
      // eslint-disable-next-line no-console
      console.error('Error deleting calculated-behavior: Table in use', err);
    } else {
      // eslint-disable-next-line no-console
      console.error('Error deleting calculated-behavior', err);
    }
  }
}

execute();
