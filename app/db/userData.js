import appData from './appData';
import utils from './utils';

import constants from '../utils/constants';
import auth from '../auth';
import errors from '../models/errors';


async function get(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`User DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  params.app = constants.HMH_APP;
  return appData.get.apply(this, [params]);
}

async function query(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['keyPrefix', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`User DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  params.app = constants.HMH_APP;
  return appData.query.apply(this, [params]);
}

async function set(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'type', 'requestor']);
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`User DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  params.app = constants.HMH_APP;
  return appData.set.apply(this, [params]);
}

async function unset(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['key', 'requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`User DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

  params.app = constants.HMH_APP;
  return appData.unset.apply(this, [params]);
}

async function list(params) {
  // Validate required params and updates owner/requestor value
  utils.validateParams(params, ['requestor']);
  utils.ensureOwnerParam(params);

  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`User DB: Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }

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
