import AWS from 'aws-sdk';

import nconf from '../../app/config';

async function execute() {
  const db = new AWS.DynamoDB({
    apiVersion: nconf.get('database').apiVersion,
    endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
    region: nconf.get('database').region,
  });

  // Load the standard schema for the calculate behavior table
  // eslint-disable-next-line global-require
  const cbSchema = require('../../database/schema/cb.json');

  cbSchema.TableName = nconf.get('database').calculatedBehaviorTableName;

  // Call DynamoDB to create the table for calculated behavior service
  try {
    const data = await db.createTable(cbSchema).promise();
    // eslint-disable-next-line no-console
    console.log('Success creating calculated-behavior table', data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating calculated-behavior table', err);
  }
}

execute();
