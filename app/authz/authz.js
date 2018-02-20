import dbAuthz from '../db/authz';
import errors from '../models/errors';
import rest from '../utils/rest';

import simple from './simple';


async function exists(authz) {
  this.logger.info(`Authz module checking whether authz config exists: ${authz}`);

  // Return true if using a built-in authz mode
  if (simple[authz]) {
    return true;
  }

  // Query for the authz mode, or throw if not found
  await dbAuthz.info.apply(this, [{ name: authz }]);

  // Return true if the authz query did not throw
  return true;
}

async function verify(shareId, requestor, shareItem) {
  this.logger.info(`Authz module verifying item '${shareId}' with share metadata '${shareItem}'`);

  const authz = shareItem.authz;

  // Check whether the authz key is a known internal type
  if (simple[authz]) {
    await simple[authz](shareId);
    return undefined;
  }

  // Query the DB to look up a registered authz method
  const authzVerifier = await dbAuthz.info.apply(this, [{ name: authz }]);

  // Build an HTTP GET request to authz URL with query string
  const authzParams = {
    ctx: shareItem.ctx,
    key: shareItem.dataKey,
    owner: shareItem.user,
    requestor,
  };

  try {
    // Implement custom transform function that checks the response status code
    //  Throw an exception for any non-200 response code to reject the authz check
    const transform = (body, response) => {
      if (response.statusCode !== 200) {
        this.logger.warn(`Authz request status code denied: ${response.statusCode}`);
        throw errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED;
      }
      return body;
    };
    await rest.get.call(this, authzVerifier.url, authzParams, transform);
  } catch (error) {
    this.logger.warn(`Authz service threw an error checking for access. Denied: ${error}`);
    throw errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED;
  }

  return undefined;
}

export default {
  exists,
  verify,
};
