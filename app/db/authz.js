import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';

async function info(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();
  const getResult = await dynamodb.get({
    Key: {
      name: params.name,
    },
    TableName: nconf.get('database').authzTableName,
  }).promise();

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
  }

  return getResult.Item;
}

async function list() {
  const dynamodb = await dynamodbClient.getClient();

  let result = [];
  let lastEvaluatedKey;
  do {
    const params = {
      TableName: nconf.get('database').authzTableName,
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
  if (params.url === undefined) {
    throw new Error('Parameter "url" is required.');
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
        url: params.url,
      },
      TableName: nconf.get('database').authzTableName,
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
    TableName: nconf.get('database').authzTableName,
  }).promise();
}

module.exports = {
  info,
  list,
  register,
  remove,
};
