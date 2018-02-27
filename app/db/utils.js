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

export default {
  rejectHiddenApp,
  validateParams,
  verifyOwnerAccess,
};
