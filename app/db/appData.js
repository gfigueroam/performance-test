import sizeof from 'object-sizeof';

import apps from './apps';
import dynamodbClient from './client';
import utils from './utils';

import constants from '../utils/constants';
import errors from '../models/errors';
import nconf from '../config';
import quota from './quota';


async function get(params) {
  // Validate required params for db query
  utils.validateParams(params, ['app', 'key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  if (params.app !== constants.HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  const getResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      key: params.key,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return getResult;
}

async function set(params) {
  // Validate required params for db query
  utils.validateParams(params, ['app', 'data', 'key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  if (params.app !== constants.HMH_APP) {
    const appInfo = await apps.info({
      name: params.app,
    });

    if (appInfo.quota !== constants.UDS_UNLIMITED_QUOTA) {
      // Enforce quota limits
      const consumedQuota = await quota.getConsumedQuota.apply(this, [params]);
      const newQuota = consumedQuota + sizeof(params.data);
      if (newQuota > appInfo.quota) {
        this.logger.warn(`App DB: Requested data (${newQuota}) would exceed quota limit (${appInfo.quota})`);
        throw errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
      }
    }
  }

  await dynamodbClient.instrumented('put', {
    Item: {
      appKey: `${params.app}${constants.DELIMITER}${params.key}`,
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      createdBy: params.requestor,
      data: params.data,
      key: params.key,
      type: params.type,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return undefined;
}

async function query(params) {
  // Validate required params for db query
  utils.validateParams(params, ['app', 'keyPrefix', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  // Ensure the target app exists before running query
  if (params.app !== constants.HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  let lastEvaluatedKey;
  let retVal = [];
  do {
    const dynamoDBParams = {
      ConsistentRead: this.database && this.database.consistentRead,
      KeyConditions: {
        appUser: {
          AttributeValueList: [`${params.app}${constants.DELIMITER}${params.owner}`],
          ComparisonOperator: 'EQ',
        },
        key: {
          AttributeValueList: [params.keyPrefix],
          ComparisonOperator: 'BEGINS_WITH',
        },
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appDataJsonTableName,
    };

    if (lastEvaluatedKey) {
      dynamoDBParams.ExclusiveStartKey = lastEvaluatedKey;
    }

    // eslint-disable-next-line no-await-in-loop
    const iterationResult = await dynamodbClient.instrumented('query', dynamoDBParams);

    lastEvaluatedKey = iterationResult.LastEvaluatedKey;
    retVal = retVal.concat(iterationResult.Items);
  } while (lastEvaluatedKey !== undefined);

  return retVal;
}

async function merge(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'data', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  if (params.app !== constants.HMH_APP) {
    const appInfo = await apps.info({
      name: params.app,
    });

    if (appInfo.quota !== constants.UDS_UNLIMITED_QUOTA) {
      // Enforce quota limits
      const consumedQuota = await quota.getConsumedQuota.apply(this, [params]);
      const newQuota = consumedQuota + sizeof(params.data);
      if (newQuota > appInfo.quota) {
        this.logger.warn(`App DB: Requested data (${newQuota}) would exceed quota limit (${appInfo.quota})`);
        throw errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
      }
    }
  }

  async function getCurrentValue() {
    const currentValue = await dynamodbClient.instrumented('get', {
      ConsistentRead: this.database && this.database.consistentRead,
      Key: {
        appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
        key: params.key,
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appDataJsonTableName,
    });

    return currentValue.Item;
  }

  async function updateExistingItem(item) {
    this.logger.info(`App DB: App data merge on existing data item: ${params.key}`);

    // merge only works on objects
    // This logic is based in part on underscore.js' implementation of isObject.
    // (underscore.js is MIT licensed.)
    if (typeof item.data === 'object' && !!item.data) {
      // Clone item.data
      const newValue = Object.assign({}, item.data);
      // Merge - updates newValue with properties from params.data
      Object.assign(newValue, params.data);

      await dynamodbClient.instrumented('update', {
        ConditionExpression: 'attribute_exists(#data) AND #data = :oldval',
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':oldval': item.data,
          ':requestor': params.requestor,
          ':value': newValue,
        },
        Key: {
          appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
          key: params.key,
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').appDataJsonTableName,
        UpdateExpression: 'SET #data = :value, updatedBy = :requestor',
      });

      return undefined;
    }

    // Not an object value - this should never happen.
    this.logger.error(`App DB: App data merge failed on non-object data: ${item.data}`);
    throw errors.codes.ERROR_CODE_INVALID_DATA_TYPE;
  }

  async function createNewItem() {
    this.logger.info(`App DB: App data merge creating new data item with key: ${params.key}`);

    // There is not an existing value, so store the new value as though the previous value was {}.
    await dynamodbClient.instrumented('put', {
      ConditionExpression: 'attribute_not_exists(#data)',
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      Item: {
        appKey: `${params.app}${constants.DELIMITER}${params.key}`,
        appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
        createdBy: params.requestor,
        data: params.data,
        key: params.key,
        type: params.type,
        user: params.owner,
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appDataJsonTableName,
    });

    return undefined;
  }

  await utils.insertOrUpdate.call(this, getCurrentValue, createNewItem, updateExistingItem);
}

async function unset(params) {
  // Validate required params for db query
  utils.validateParams(params, ['app', 'key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  if (params.app !== constants.HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  // This API needs to throw an error if we delete a key which does not exist.
  // So we need to query first for the item.
  const getResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      key: params.key,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appDataJsonTableName,
  });

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_KEY_NOT_FOUND;
  }

  await dynamodbClient.instrumented('delete', {
    Key: {
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      key: params.key,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return undefined;
}

async function list(params) {
  // Validate required params for db query
  utils.validateParams(params, ['app', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  if (params.app !== constants.HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  async function getUserDataKeys() {
    let lastEvaluatedKey;
    let items = [];
    do {
      const dynamoDBParams = {
        ConsistentRead: this.database && this.database.consistentRead,
        ExpressionAttributeNames: {
          '#key': 'key',
        },
        ExpressionAttributeValues: {
          ':appUser': `${params.app}${constants.DELIMITER}${params.owner}`,
        },
        KeyConditionExpression: 'appUser = :appUser',
        ProjectionExpression: '#key', // Only return the data we are interested in
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').appDataJsonTableName,
      };

      if (lastEvaluatedKey) {
        dynamoDBParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      // eslint-disable-next-line no-await-in-loop
      const iterationResult = await dynamodbClient.instrumented('query', dynamoDBParams);

      items = items.concat(iterationResult.Items);
      lastEvaluatedKey = iterationResult.LastEvaluatedKey;
    } while (lastEvaluatedKey !== undefined);

    return items.map((item) => (item.key));
  }

  async function getSharedIds() {
    let lastEvaluatedKey;
    let items = [];
    do {
      // Note: ConsistentRead cannot be set to true when querying an Index.
      const dynamoDBParams = {
        ExpressionAttributeNames: {
          '#key': 'key',
          '#user': 'user',
        },
        ExpressionAttributeValues: {
          ':user': params.owner,
        },
        IndexName: 'uds-share-by-user-gsi',
        KeyConditionExpression: '#user = :user',
        ProjectionExpression: '#key', // Only return the data we are interested in
        ReturnConsumedCapacity: 'TOTAL',
        TableName: nconf.get('database').shareTableName,
      };

      if (lastEvaluatedKey) {
        dynamoDBParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      // eslint-disable-next-line no-await-in-loop
      const iterationResult = await dynamodbClient.instrumented('query', dynamoDBParams);

      items = items.concat(iterationResult.Items);
      lastEvaluatedKey = iterationResult.LastEvaluatedKey;
    } while (lastEvaluatedKey !== undefined);

    return items.map((item) => (item.key));
  }

  // If we are querying for user data, we need to return shareIds. Otherwise we
  // shouldn't query the share table at all, since app  data cannot be shared
  const allResults = {};
  allResults.keys = await getUserDataKeys.apply(this);

  if (params.app === constants.HMH_APP) {
    allResults.shared = await getSharedIds.apply(this);
  }

  return allResults;
}

async function getApps(params) {
  // Validate required params
  utils.validateParams(params, ['user']);

  let lastEvaluatedKey;
  let items = [];
  do {
    // Note: We do not set consistent read here because DynamoDB forbids consistent
    // reads when accessing a global secondary index.
    const dynamoDBParams = {
      ExpressionAttributeNames: {
        '#user': 'user',
      },
      ExpressionAttributeValues: {
        ':user': params.user,
      },
      IndexName: 'uds-app-data-json-gsi',
      KeyConditionExpression: '#user = :user',
      ProjectionExpression: 'appKey', // Only return the data we are interested in
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appDataJsonTableName,
    };

    if (lastEvaluatedKey) {
      dynamoDBParams.ExclusiveStartKey = lastEvaluatedKey;
    }

    // eslint-disable-next-line no-await-in-loop
    const iterationResult = await dynamodbClient.instrumented('query', dynamoDBParams);

    items = items.concat(iterationResult.Items);
    lastEvaluatedKey = iterationResult.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  const appsInUse = {};
  items.forEach(item => {
    appsInUse[item.appKey.substr(0, item.appKey.indexOf(constants.DELIMITER))] = 1;
  });

  // HMH_APP is a special built-in app; don't return.
  [constants.HMH_APP, constants.CB_APP].forEach((reservedApp) => {
    delete appsInUse[reservedApp];
  });

  return Object.keys(appsInUse);
}

module.exports = {
  get,
  getApps,
  list,
  merge,
  query,
  set,
  unset,
};
