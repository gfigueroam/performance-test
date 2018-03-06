import dynamodbClient from './client';
import utils from './utils';

import errors from '../models/errors';
import nconf from '../config';


async function set(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'requestor']);
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  await dynamodbClient.instrumented('put', {
    Item: {
      createdBy: params.requestor,
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
  // Validate required params for db query
  utils.validateParams(params, ['key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

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
  // Validate required params for db query
  utils.validateParams(params, ['key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  const getResult = dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.key,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').calculatedBehaviorTableName,
  });
  return getResult;
}

async function query(params) {
  // Validate required params for db query
  utils.validateParams(params, ['keyPrefix', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

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
  // Validate required params for db query
  utils.validateParams(params, ['key', 'value', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

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
          ':requestor': params.requestor,
          ':value': params.value,
        },
        Key: {
          key: params.key,
          user: params.owner,
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = #data + :value, updatedBy = :requestor',
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
        createdBy: params.requestor,
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
  // Validate required params for db query
  utils.validateParams(params, ['key', 'data', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

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
          ':requestor': params.requestor,
          ':value': newValue,
        },
        Key: {
          key: params.key,
          user: params.owner,
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').calculatedBehaviorTableName,
        UpdateExpression: 'SET #data = :value, updatedBy = :requestor',
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
        createdBy: params.requestor,
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
