import dynamodbClient from './dynamoDBClient';
import utils from './utils';

import nconf from '../config';
import errors from '../models/errors';
import auth from '../auth';


async function set(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'requestor']);
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  await dynamodbClient.instrumented('put', {
    Item: {
      data: params.data,
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  return undefined;
}

async function unset(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  await dynamodbClient.instrumented('delete', {
    Key: {
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  return undefined;
}

async function get(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  return dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });
}

async function query(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['keyPrefix', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  let lastEvaluatedKey;
  let items = [];
  do {
    const dynamoDBParams = {
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
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').calculatedBehaviorTableName,
    };

    if (lastEvaluatedKey) {
      dynamoDBParams.ExclusiveStartKey = lastEvaluatedKey;
    }
    // eslint-disable-next-line no-await-in-loop
    const iterationResult = await dynamodbClient.instrumented('query', dynamoDBParams);
    items = items.concat(iterationResult.Items);
    lastEvaluatedKey = iterationResult.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  return items;
}

async function atomicUpdate(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'value', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  let newValue;
  let conditionExpression;
  // Is there an existing item?
  if (currentValue.Item) {
    this.logger.info(`CB DB: Running atomic update on existing data item (${params.key})`);
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
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = #data + :value',
      });

      return undefined;
    }

    // else
    this.logger.error(`CB DB: Atomic update failed on non-numeric data: ${currentValue.Item.data}`);
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  } else {
    this.logger.info(`CB DB: Atomic update creating new data item with key: ${params.key}`);

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
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').calculatedBehaviorTableName,
    });

    return undefined;
  }
}

async function merge(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'data', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`CB DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodbClient.instrumented('get', {
    Key: {
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });

  let newValue;
  let conditionExpression;
  // Is there an existing item?
  if (currentValue.Item) {
    this.logger.info(`CB DB: Calculated behavior merge on existing data item: ${params.key}`);

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
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = :value',
      });

      return undefined;
    }

    // Not an object value
    this.logger.error(`CB DB: Calculated behavior merge failed on non-object data: ${currentValue.Item.data}`);
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  } else {
    this.logger.info(`CB DB: Calculated behavior merge creating new data item with key: ${params.key}`);

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
      ReturnConsumedCapacity: 'TOTAL',
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
