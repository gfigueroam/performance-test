function validateParams(params, requiredList) {
  requiredList.forEach(p => {
    if (!params[p]) {
      throw new Error(`Parameter "${p}" is required.`);
    }
  });
}

function ensureOwnerParam(params) {
  // If owner is not specified, default to the requestor.
  if (!params.owner) {
    params.owner = params.requestor;
  }
}

export default {
  ensureOwnerParam,
  validateParams,
};
