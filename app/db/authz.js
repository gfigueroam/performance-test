import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';

async function info(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }

  const getResult = await dynamodbClient.instrumented('get', {
    Key: {
      name: params.name,
    },
    TableName: nconf.get('database').authzTableName,
  });

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_AUTHZ_NOT_FOUND;
  }

  return getResult.Item;
}

async function list() {
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
    const iterationResult = await dynamodbClient.instrumented('scan', params);
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

  try {
    await dynamodbClient.instrumented('put', {
      ConditionExpression: 'attribute_not_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,
        url: params.url,
      },
      TableName: nconf.get('database').authzTableName,
    });
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

  await dynamodbClient.instrumented('delete', {
    Key: {
      name: params.name,
    },
    TableName: nconf.get('database').authzTableName,
  });
}

module.exports = {
  info,
  list,
  register,
  remove,
};
