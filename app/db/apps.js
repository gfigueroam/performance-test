import dynamodbClient from './dynamoDBClient';
import utils from './utils';

import nconf from '../config';
import errors from '../models/errors';
import constants from '../utils/constants';


async function setQuota(params) {
  // Validate required params
  utils.validateParams(params, ['name']);
  utils.rejectHiddenApp(params.name);

  if (params.quota === undefined) {
    throw new Error('Parameter "quota" is required.');
  }

  try {
    await dynamodbClient.instrumented('put', {
      ConditionExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,
        quota: params.quota,
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appsTableName,
    });
  } catch (err) {
    // Does the app not exist?
    if (err.message === 'The conditional request failed') {
      throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
    }
    throw err;
  }
}

async function info(params) {
  // Validate required params
  utils.validateParams(params, ['name']);
  utils.rejectHiddenApp(params.name);

  const getResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      name: params.name,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appsTableName,
  });

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
  }

  return getResult.Item;
}

async function list() {
  let result = [];
  let lastEvaluatedKey;
  do {
    const params = {
      ConsistentRead: this.database && this.database.consistentRead,
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appsTableName,
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

  // Remove 'cb' and 'hmh' apps.
  const filteredApps = [];
  result.forEach((item) => {
    if (item.name !== constants.HMH_APP && item.name !== constants.CB_APP) {
      filteredApps.push(item);
    }
  });

  return filteredApps;
}

async function register(params) {
  // Validate required params
  utils.validateParams(params, ['name']);
  utils.rejectHiddenApp(params.name, errors.codes.ERROR_CODE_INVALID_APP);

  if (params.quota === undefined) {
    throw new Error('Parameter "quota" is required.');
  }

  try {
    await dynamodbClient.instrumented('put', {
      ConditionExpression: 'attribute_not_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,
        quota: params.quota,
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: nconf.get('database').appsTableName,
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
  // Validate required params
  utils.validateParams(params, ['name']);
  utils.rejectHiddenApp(params.name);

  await dynamodbClient.instrumented('delete', {
    Key: {
      name: params.name,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appsTableName,
  });
}

module.exports = {
  info,
  list,
  register,
  remove,
  setQuota,
};
