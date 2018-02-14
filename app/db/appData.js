import sizeof from 'object-sizeof';

import nconf from '../config';
import dynamodbClient from './dynamoDBClient';
import apps from './apps';
import errors from '../models/errors';
import constants from '../utils/constants';
import quota from './quota';
import auth from '../auth';

async function get(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

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
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return getResult;
}

async function set(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  if (params.app !== constants.HMH_APP) {
    const appInfo = await apps.info({
      name: params.app,
    });

    // Enforce quota limits
    const consumedQuota = await quota.getConsumedQuota.apply(this, [params]);
    const newQuota = consumedQuota + sizeof(params.data);
    if (newQuota > appInfo.quota) {
      this.logger.warn(`App DB: Requested data (${newQuota}) would exceed quota limit (${appInfo.quota})`);
      throw errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
    }
  }

  await dynamodbClient.instrumented('put', {
    Item: {
      appKey: `${params.app}${constants.DELIMITER}${params.key}`,
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      data: params.data,
      key: params.key,
      type: params.type,
      user: params.owner,
    },
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return undefined;
}

async function query(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.keyPrefix) {
    throw new Error('Parameter "keyPrefix" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }

  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  // Ensure the target app exists before running query
  if (params.app !== constants.HMH_APP) {
    await apps.info({
      name: params.app,
    });
  }

  // TODO: Paginate
  const retVal = await dynamodbClient.instrumented('query', {
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
    TableName: nconf.get('database').appDataJsonTableName,
  });
  return retVal;
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
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  if (params.app !== constants.HMH_APP) {
    const appInfo = await apps.info({
      name: params.app,
    });

    // Enforce quota limits
    const consumedQuota = await quota.getConsumedQuota.apply(this, [params]);
    if (consumedQuota + sizeof(params.data) > appInfo.quota) {
      throw errors.codes.ERROR_CODE_QUOTA_EXCEEDED;
    }
  }

  // Look up the current value that already exists.
  const currentValue = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      key: params.key,
    },
    TableName: nconf.get('database').appDataJsonTableName,
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
          appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
          key: params.key,
        },
        TableName: nconf.get('database').appDataJsonTableName,
        UpdateExpression: 'SET #data = :value',
      });

      return newValue;
    }

    // Not an object value - this should never happen.
    this.logger.error(`Found a non-object data type in app data for key ${params.key}, user ${params.owner}, app ${params.app}.`);
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
        appKey: `${params.app}${constants.DELIMITER}${params.key}`,
        appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
        data: params.data,
        key: params.key,
        type: params.type,
        user: params.owner,
      },
      TableName: nconf.get('database').appDataJsonTableName,
    });

    return newValue;
  }
}

async function unset(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

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
    TableName: nconf.get('database').appDataJsonTableName,
  });

  return undefined;
}

async function list(params) {
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`App DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

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
  // shouldn't query the share table at all, as it is throwaway work since app
  // data cannot be shared.
  if (params.app === constants.HMH_APP) {
    // Wait for both functions running in parallel.
    const userDataKeys = getUserDataKeys.apply(this);
    const shareIds = getSharedIds.apply(this);

    return {
      keys: await userDataKeys,
      shared: await shareIds,
    };
    // eslint-disable-next-line no-else-return
  } else {
    const userDataKeys = getUserDataKeys.apply(this);

    return {
      keys: await userDataKeys,
    };
  }
}

async function getApps(params) {
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

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
  delete appsInUse[constants.HMH_APP];

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
