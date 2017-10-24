import AWS from 'aws-sdk';
import nconf from '../config';

const dynamodb = new AWS.DynamoDB({
  apiVersion: nconf.get('database').apiVersion,
  endpoint: new AWS.Endpoint(nconf.get('database').endpoint),
  region: nconf.get('database').region,
});

function set(params) {
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }

  /* eslint-disable sort-keys */
  return dynamodb.putItem({
    Item: {
      user: {
        S: params.user,
      },
      key: {
        S: params.key,
      },
      data: {
        // TODO: We need to intelligently detect the type of params.data
        // and store appropriately
        S: params.data,
      },
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  }).promise();
}

module.exports = {
  set,
};
