import nconf from '../config';
import dynamodbClient from './dynamoDBClient';
import apps from './apps';
import errors from '../models/errors';

const HMH_APP = 'hmh';

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

  if (params.app !== HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

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

  if (params.app !== HMH_APP) {
    await apps.info({
      name: params.app,
    });
    // TODO: Verify the user has sufficient quota remaining (except for built-in HMH app)
  }

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

  if (params.app !== HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  const dynamodb = await dynamodbClient.getClient();

  // This API needs to throw an error if we delete a key which does not exist.
  // So we need to query first for the item.
  const getResult = await dynamodb.get({
    Key: {
      appUser: params.app + params.user,
      key: params.key,
    },
    TableName: nconf.get('database').appDataJsonTableName,
  }).promise();

  if (!getResult.Item) {
    throw new Error(errors.codes.ERROR_CODE_KEY_NOT_FOUND);
  }

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

  if (params.app !== HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

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
