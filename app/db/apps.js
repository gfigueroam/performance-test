import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';

async function setQuota(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.quota === undefined) {
    throw new Error('Parameter "quota" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();
  try {
    await dynamodb.put({
      ConditionExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,
        quota: params.quota,
      },
      TableName: nconf.get('database').appsTableName,
    }).promise();
  } catch (err) {
    // Does the app not exist?
    if (err.message === 'The conditional request failed') {
      throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
    }
    throw err;
  }
}

async function info(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();
  const getResult = await dynamodb.get({
    Key: {
      name: params.name,
    },
    TableName: nconf.get('database').appsTableName,
  }).promise();

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
  }

  return getResult.Item;
}

async function list() {
  const dynamodb = await dynamodbClient.getClient();

  let result = [];
  let lastEvaluatedKey;
  do {
    const params = {
      TableName: nconf.get('database').appsTableName,
    };

    // Pagination support if necessary.
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    // eslint-disable-next-line no-await-in-loop
    const iterationResult = await dynamodb.scan(params).promise();
    result = result.concat(iterationResult.Items);
    lastEvaluatedKey = iterationResult.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  return result;
}

async function register(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.quota === undefined) {
    throw new Error('Parameter "quota" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();

  try {
    await dynamodb.put({
      ConditionExpression: 'attribute_not_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,
        quota: params.quota,
      },
      TableName: nconf.get('database').appsTableName,
    }).promise();
  } catch (err) {
    // Is the name taken?
    if (err.message === 'The conditional request failed') {
      throw errors.codes.ERROR_CODE_NAME_IN_USE;
    }
    throw err;
  }
}

async function remove(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();
  await dynamodb.delete({
    Key: {
      name: params.name,
    },
    TableName: nconf.get('database').appsTableName,
  }).promise();
}

module.exports = {
  info,
  list,
  register,
  remove,
  setQuota,
};
