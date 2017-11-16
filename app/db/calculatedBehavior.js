import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';

async function set(params) {
  const dynamodb = await dynamodbClient.getClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }

  /* eslint-disable sort-keys */
  await dynamodb.put({
    Item: {
      user: params.user,
      key: params.key,
      data: params.data,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  }).promise();

  return undefined;
}

async function unset(params) {
  const dynamodb = await dynamodbClient.getClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }

  await dynamodb.delete({
    Key: {
      key: params.key,
      user: params.user,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  }).promise();

  return undefined;
}

async function get(params) {
  const dynamodb = await dynamodbClient.getClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }

  /* eslint-disable sort-keys */
  return dynamodb.get({
    Key: {
      user: params.user,
      key: params.key,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  }).promise();
}

async function atomicUpdate(params) {
  const dynamodb = await dynamodbClient.getClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.value) {
    throw new Error('Parameter "value" is required.');
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodb.get({
    Key: {
      key: params.key,
      user: params.user,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  }).promise();

  let newValue;
  let conditionExpression;
  // Is there an existing item?
  if (currentValue.Item) {
    // atomic update only works on numeric values
    if (Object.prototype.toString.call(currentValue.Item.data) === '[object Number]') {
      newValue = currentValue.Item.data + params.value;
      conditionExpression = 'attribute_exists(#data)';

      await dynamodb.update({
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':value': params.value,
        },
        Key: {
          key: params.key,
          user: params.user,
        },
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = #data + :value',
      }).promise();

      return undefined;
    }

    // else
    throw new Error(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
  } else {
    // There is not an existing value, so store the new value as though the previous value was 0.
    newValue = params.value;
    conditionExpression = 'attribute_not_exists(#data)';
    await dynamodb.put({
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      Item: {
        data: newValue,
        key: params.key,
        user: params.user,
      },
      TableName: nconf.get('database').calculatedBehaviorTableName,
    }).promise();

    return undefined;
  }
}

async function merge(params) {
  const dynamodb = await dynamodbClient.getClient();

  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodb.get({
    Key: {
      key: params.key,
      user: params.user,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  }).promise();

  let newValue;
  let conditionExpression;
  // Is there an existing item?
  if (currentValue.Item) {
    // merge only works on objects
    // This logic is based in part on underscore.js' implementation of isObject.
    // (underscore.js is MIT licensed.)
    if (typeof currentValue.Item.data === 'object' && !!currentValue.Item.data) {
      // Clone currentValue.Item.data
      newValue = Object.assign({}, currentValue.Item.data);
      // Merge - updates newValue with properties from params.data
      Object.assign(newValue, params.data);

      await dynamodb.update({
        ConditionExpression: 'attribute_exists(#data) AND #data = :oldval',
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':oldval': currentValue.Item.data,
          ':value': newValue,
        },
        Key: {
          key: params.key,
          user: params.user,
        },
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = :value',
      }).promise();

      return undefined;
    }

    // Not an object value
    throw new Error(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
  } else {
    // There is not an existing value, so store the new value as though the previous value was {}.
    newValue = params.value;
    conditionExpression = 'attribute_not_exists(#data)';
    await dynamodb.put({
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      Item: {
        data: params.data,
        key: params.key,
        user: params.user,
      },
      TableName: nconf.get('database').calculatedBehaviorTableName,
    }).promise();

    return undefined;
  }
}

module.exports = {
  atomicUpdate,
  get,
  merge,
  set,
  unset,
};
