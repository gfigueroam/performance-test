import constants from '../utils/constants';

async function ensureReadConsistency(swatchCtx, next) {
  // Create a new `database` object on swatchCtx and check for a header
  //  that will require DB queries to enforce read consistency
  // Currently only be used for BVTs where reads/writes are immediate
  swatchCtx.database = {
    consistentRead: !!swatchCtx.req.headers[
      constants.UDS_CONSISTENT_READ_HEADER
    ],
  };

  await next();
}

export default {
  ensureReadConsistency,
};
