import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';
import auth from '../auth';

async function set(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  /* eslint-disable sort-keys */
  await dynamodbClient.instrumented('put', {
    Item: {
      user: params.owner,
      key: params.key,
      data: params.data,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  });

  return undefined;
}

async function unset(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  await dynamodbClient.instrumented('delete', {
    Key: {
      key: params.key,
      user: params.owner,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  return undefined;
}

async function get(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  /* eslint-disable sort-keys */
  return dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      user: params.owner,
      key: params.key,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
    /* eslint-enable sort-keys */
  });
}

async function query(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.keyPrefix) {
    throw new Error('Parameter "keyPrefix" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // TODO: Paginate
  const retVal = await dynamodbClient.instrumented('query', {
    ConsistentRead: this.database && this.database.consistentRead,
    KeyConditions: {
      key: {
        AttributeValueList: [params.keyPrefix],
        ComparisonOperator: 'BEGINS_WITH',
      },
      user: {
        AttributeValueList: [params.owner],
        ComparisonOperator: 'EQ',
      },
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  return retVal;
}

async function atomicUpdate(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.value) {
    throw new Error('Parameter "value" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.key,
      user: params.owner,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  let newValue;
  let conditionExpression;
  // Is there an existing item?
  if (currentValue.Item) {
    // atomic update only works on numeric values
    if (Object.prototype.toString.call(currentValue.Item.data) === '[object Number]') {
      newValue = currentValue.Item.data + params.value;
      conditionExpression = 'attribute_exists(#data)';

      await dynamodbClient.instrumented('update', {
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':value': params.value,
        },
        Key: {
          key: params.key,
          user: params.owner,
        },
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = #data + :value',
      });

      return undefined;
    }

    // else
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  } else {
    // There is not an existing value, so store the new value as though the previous value was 0.
    newValue = params.value;
    conditionExpression = 'attribute_not_exists(#data)';
    await dynamodbClient.instrumented('put', {
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      Item: {
        data: newValue,
        key: params.key,
        user: params.owner,
      },
      TableName: nconf.get('database').calculatedBehaviorTableName,
    });

    return undefined;
  }
}

async function merge(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodbClient.instrumented('get', {
    Key: {
      key: params.key,
      user: params.owner,
    },
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

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

      await dynamodbClient.instrumented('update', {
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
          user: params.owner,
        },
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = :value',
      });

      return undefined;
    }

    // Not an object value
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  } else {
    // There is not an existing value, so store the new value as though the previous value was {}.
    newValue = params.data;
    conditionExpression = 'attribute_not_exists(#data)';
    await dynamodbClient.instrumented('put', {
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      Item: {
        data: params.data,
        key: params.key,
        user: params.owner,
      },
      TableName: nconf.get('database').calculatedBehaviorTableName,
    });

    return undefined;
  }
}

module.exports = {
  atomicUpdate,
  get,
  merge,
  query,
  set,
  unset,
};
