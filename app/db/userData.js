import appData from './appData';
import utils from './utils';

import constants from '../utils/constants';


async function get(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  params.app = constants.HMH_APP;
  return appData.get.apply(this, [params]);
}

async function query(params) {
  // Validate required params for db query
  utils.validateParams(params, ['keyPrefix', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  params.app = constants.HMH_APP;
  return appData.query.apply(this, [params]);
}

async function set(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'type', 'requestor']);
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  params.app = constants.HMH_APP;
  return appData.set.apply(this, [params]);
}

async function unset(params) {
  // Validate required params for db query
  utils.validateParams(params, ['key', 'requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  params.app = constants.HMH_APP;
  return appData.unset.apply(this, [params]);
}

async function list(params) {
  // Validate required params for db query
  utils.validateParams(params, ['requestor']);

  // Authorize that requestor has access to owner data
  await utils.verifyOwnerAccess.call(this, params);

  params.app = constants.HMH_APP;
  const appDataList = await appData.list.apply(this, [params]);
  return appDataList;
}

module.exports = {
  get,
  list,
  query,
  set,
  unset,
};
