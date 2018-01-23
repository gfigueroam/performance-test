import appData from './appData';
import constants from '../utils/constants';
import auth from '../auth';
import errors from '../models/errors';

async function get(params) {
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
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw new Error(errors.codes.ERROR_CODE_AUTH_INVALID);
  }

  params.app = constants.HMH_APP;
  return appData.get(params);
}

async function set(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.type) {
    throw new Error('Parameter "type" is required.');
  }
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw new Error(errors.codes.ERROR_CODE_AUTH_INVALID);
  }

  params.app = constants.HMH_APP;
  return appData.set(params);
}

async function unset(params) {
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
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw new Error(errors.codes.ERROR_CODE_AUTH_INVALID);
  }

  params.app = constants.HMH_APP;
  return appData.unset(params);
}

async function list(params) {
  if (!params.requestor) {
    throw new Error('Parameter "requestor" is required.');
  }
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
  // Verify requestor has access to owner's data.
  const allowed = await auth.ids.hasAccessTo(params.requestor, params.owner);
  if (!allowed) {
    throw new Error(errors.codes.ERROR_CODE_AUTH_INVALID);
  }

  params.app = constants.HMH_APP;
  return appData.list(params);
}

module.exports = {
  get,
  list,
  set,
  unset,
};
