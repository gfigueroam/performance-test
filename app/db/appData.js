import nconf from '../config';
import dynamodbClient from './dynamoDBClient';

async function getJson(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }

  // TODO: Verify app is properly registered in the system.

  const dynamodb = await dynamodbClient.getClient();
  const getResult = await dynamodb.get({
    Key: {
      appUser: params.app + params.user,
      key: params.key,
    },
    TableName: nconf.get('database').appDataJsonTableName,
  }).promise();

  return getResult;
}

async function setJson(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }

  // TODO: Verify app is properly registered in the system.
  // TODO: Verify the user has sufficient quota remaining (except for built-in HMH app)

  const dynamodb = await dynamodbClient.getClient();

  await dynamodb.put({
    Item: {
      appKey: params.app + params.key,
      appUser: params.app + params.user,
      data: params.data,
      key: params.key,
      type: params.type,
      user: params.user,
    },
    TableName: nconf.get('database').appDataJsonTableName,
  }).promise();

  return undefined;
}

async function unsetJson(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  // TODO: Verify app is properly registered in the system.

  const dynamodb = await dynamodbClient.getClient();

  await dynamodb.delete({
    Key: {
      appUser: params.app + params.user,
      key: params.key,
    },
    TableName: nconf.get('database').appDataJsonTableName,
  }).promise();

  return undefined;
}

async function listJson(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  // TODO: Verify app is properly registered in the system.

  const dynamodb = await dynamodbClient.getClient();

  // TODO: Paginate

  const list = await dynamodb.query({
    ExpressionAttributeNames: {
      '#key': 'key',
    },
    ExpressionAttributeValues: {
      ':appUser': params.app + params.user,
    },
    KeyConditionExpression: 'appUser = :appUser',
    ProjectionExpression: '#key', // Only return the data we are interested in
    TableName: nconf.get('database').appDataJsonTableName,
  }).promise();

  return list;
}

module.exports = {
  getJson,
  listJson,
  setJson,
  unsetJson,
};
