import bcrypt from 'bcrypt';

import nconf from '../config';
import errors from '../models/errors';
import dynamodbClient from './dynamoDBClient';

// Never, ever change this, or all existing passwords will be invalid.
const SALT_ROUNDS = 15;

async function addPassword(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.password === undefined) {
    throw new Error('Parameter "password" is required.');
  }

  // Generate the password hash.
  const hash = await bcrypt.hash(params.password, SALT_ROUNDS);

  const dynamodb = await dynamodbClient.getClient();

  try {
    await dynamodb.update({
      ConditionExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':password': dynamodb.createSet([hash]),
      },
      Key: {
        name: params.name,
      },
      TableName: nconf.get('database').appsTableName,
      UpdateExpression: 'ADD password :password',
    }).promise();
  } catch (err) {
    // TODO: Detect the error message when password already exists in list.
    //  ^ can't do this since the hash is one-way and uses a different salt each time
    //    unless we compare the added password to each existing hash.
    if (err.message === 'The conditional request failed') {
      throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
    }
    return Promise.reject(err);
  }

  return Promise.resolve(hash);
}

async function removePassword(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.passwordId === undefined) {
    throw new Error('Parameter "passwordId" is required.');
  }

  const dynamodb = await dynamodbClient.getClient();

  try {
    await dynamodb.update({
      ConditionExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':password': dynamodb.createSet([params.passwordId]),
      },
      Key: {
        name: params.name,
      },
      TableName: nconf.get('database').appsTableName,
      UpdateExpression: 'DELETE password :password',
    }).promise();
  } catch (err) {
    // TODO: Detect the error message when passwordId does not exist
    if (err.message === 'The conditional request failed') {
      throw errors.codes.ERROR_CODE_APP_NOT_FOUND;
    }
    return Promise.reject(err);
  }

  return Promise.resolve();
}

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

  // Map
  // {"values":["$2a$15$U0OGL04m8omchVRc4Flv1.7M58XZh3roZZHt9wntyQvu3VFjC5r1C"],"type":"String"}
  // into an array
  if (getResult.Item.password) {
    getResult.Item.passwords = getResult.Item.password.values;
    delete getResult.Item.password;
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

  let password;
  if (params.password) {
    const hash = await bcrypt.hash(params.password, SALT_ROUNDS);
    // If createSet is not called, a List is used instead which harms removePassword API
    password = dynamodb.createSet([hash]);
  }

  try {
    await dynamodb.put({
      ConditionExpression: 'attribute_not_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      Item: {
        name: params.name,

        password,
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
  addPassword,
  info,
  list,
  register,
  remove,
  removePassword,
  setQuota,
};
