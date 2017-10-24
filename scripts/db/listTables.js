import AWS from 'aws-sdk';

import nconf from '../../app/config';

async function execute() {
  const db = new AWS.DynamoDB({
    apiVersion: nconf.get('database').apiVersion,
    endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
    region: nconf.get('database').region,
  });

  // Call DynamoDB to list all tables in local instance
  try {
    const data = await db.listTables({}).promise();
    // eslint-disable-next-line no-console
    console.log('Table names are ', data.TableNames);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error', err.code);
  }
}

execute();
