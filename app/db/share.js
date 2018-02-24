import uuid from 'uuid';

import authz from '../authz';
import constants from '../utils/constants';
import errors from '../models/errors';
import nconf from '../config';

import dynamodbClient from './dynamoDBClient';
import userDB from './userData';
import utils from './utils';


async function getShared(params) {
  // Validate required params
  utils.validateParams(params, ['id', 'requestor']);

  // First query the share table by share id to get metadata
  const shareResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.id,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').shareTableName,
  });

  // Return undefined if the unique share id does not exist
  if (!shareResult.Item) {
    this.logger.info(`Share DB: GetShare call failed because Share ID does not exist: ${params.id}`);
    return undefined;
  }

  // Now run the correct authz check to verify access to data
  //  Throws on error or any non-200 response from authz endpoint
  await authz.verify.apply(this, [params.id, params.requestor, shareResult.Item]);

  // Query for item data in app data table belonging to owner
  const getResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      appUser: shareResult.Item.appUser,
      key: shareResult.Item.dataKey,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').appDataJsonTableName,
  });

  // Return undefined if the key in the share record does not exist
  if (!getResult.Item) {
    this.logger.info(`Share DB: GetShare call failed because data key does not exist: ${shareResult.Item.dataKey}`);
    return undefined;
  }

  return {
    data: getResult.Item.data,
    key: getResult.Item.key,
    type: getResult.Item.type,
  };
}

async function share(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'authz', 'ctx', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  // Throw an error if either the key or authz config doesnt exist
  //  authz query will throw, user data query will return undefined
  authz.exists.apply(this, [params.authz]);

  const keyValue = await userDB.get.apply(this, [{
    key: params.key,
    owner: params.owner,
    requestor: params.requestor,
  }]);
  if (!keyValue) {
    throw errors.codes.ERROR_CODE_KEY_NOT_FOUND;
  }

  // Generate a unique share id and share in context of HMH app
  params.id = uuid.v4();
  params.app = constants.HMH_APP;

  await dynamodbClient.instrumented('put', {
    Item: {
      appKey: `${params.app}${constants.DELIMITER}${params.key}`,
      appUser: `${params.app}${constants.DELIMITER}${params.owner}`,
      authz: params.authz,
      ctx: params.ctx,
      dataKey: params.key,
      key: params.id,
      user: params.owner,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').shareTableName,
  });

  return params.id;
}

async function unshare(params) {
  // Validate required params for db query
  utils.validateParams(params, ['id', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  // Query for item first and throw an error if share id does not exist
  const getResult = await dynamodbClient.instrumented('get', {
    ConsistentRead: this.database && this.database.consistentRead,
    Key: {
      key: params.id,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').shareTableName,
  });

  if (!getResult.Item) {
    throw errors.codes.ERROR_CODE_SHARE_ID_NOT_FOUND;
  }

  await dynamodbClient.instrumented('delete', {
    Key: {
      key: params.id,
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: nconf.get('database').shareTableName,
  });

  return undefined;
}

module.exports = {
  getShared,
  share,
  unshare,
};
