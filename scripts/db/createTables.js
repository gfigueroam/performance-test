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

  // Load the standard schemas

  await Promise.all([
    {
      schema: '../../database/schema/appdata.json',
      tableName: nconf.get('database').appDataJsonTableName,
    },
    {
      schema: '../../database/schema/appdata.json',
      tableName: nconf.get('database').appDataBlobTableName,
    },
    {
      schema: '../../database/schema/cb.json',
      tableName: nconf.get('database').calculatedBehaviorTableName,
    },
    {
      schema: '../../database/schema/apps.json',
      tableName: nconf.get('database').appsTableName,
    },
  ].map(async (nameAndSchema) => {
    // eslint-disable-next-line no-console
    console.log(`now working on ${nameAndSchema.tableName}`);

    // Call DynamoDB to create the table for calculated behavior service
    try {
      /* eslint-disable global-require */
      /* eslint-disable import/no-dynamic-require */
      const cbSchema = require(nameAndSchema.schema);
      /* eslint-enable import/no-dynamic-require */
      /* eslint-enable global-require */

      // eslint-disable-next-line no-console
      console.log(`Loaded schema for ${nameAndSchema.tableName}`);

      cbSchema.TableName = nameAndSchema.tableName;
      // eslint-disable-next-line no-console
      console.log(`calling db.createTable for ${nameAndSchema.tableName}`);
      const data = await db.createTable(cbSchema).promise();
      // eslint-disable-next-line no-console
      console.log(`Success creating ${nameAndSchema.tableName} table`, data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error creating ${nameAndSchema.tableName} table`, err);
    }
  }));
}

execute();
