import auth from '../auth';
import errors from '../models/errors';
import constants from '../utils/constants';

function validateParams(params, requiredKeys) {
  // Verify that params dict has a value for each required key
  requiredKeys.forEach(p => {
    if (!params[p]) {
      throw new Error(`Parameter "${p}" is required.`);
    }
  });
}

function rejectHiddenApp(appName, errorCode) {
  if (appName === constants.HMH_APP || appName === constants.CB_APP) {
    throw errorCode || errors.codes.ERROR_CODE_APP_NOT_FOUND;
  }
}

async function verifyOwnerAccess(params) {
  // If owner is not specified, default to the requestor
  if (!params.owner) {
    params.owner = params.requestor;
  }

  // Verify requestor has access to owner's data
  const allowed = await auth.ids.hasAccessTo.apply(this, [params.requestor, params.owner]);
  if (!allowed) {
    this.logger.warn(`Requestor (${params.requestor}) access denied to owner (${params.owner})`);
    throw errors.codes.ERROR_CODE_AUTH_INVALID;
  }
}

async function insertOrUpdate(getFn, conditionalCreateFn, conditionalUpdateFn) {
  let data = await getFn.call(this);
  if (!data) {
    try {
      const setResult = await conditionalCreateFn.call(this);
      return setResult;
    } catch (err) {
      // Do nothing; we will fall back and execute the getFn again and call updateFn.
    }
  }
  try {
    data = await getFn.call(this);
    const result = await conditionalUpdateFn.call(this, data);
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
}

export default {
  insertOrUpdate,
  rejectHiddenApp,
  validateParams,
  verifyOwnerAccess,
};
