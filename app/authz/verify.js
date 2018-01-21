import dbAuthz from '../db/authz';
import dbShare from '../db/share';
import rest from '../utils/rest';

import simple from './simple';

const defaultAuthz = {
  uds_authz_allow: simple.allow,
  uds_authz_deny: simple.deny,
};

async function verifier(authz, shareId) {
  this.logger.info(`Authz module verifying item '${shareId}' with verifier '${authz}'`);

  // Check whether the authz key is a known internal type
  if (defaultAuthz[authz]) {
    await defaultAuthz[authz](shareId);
    return undefined;
  }

  // Query the DB to look up a registered authz method
  const authzVerifier = await dbAuthz.info({ name: authz });

  // Query the DB to look up the shared content by ID
  const shareData = await dbShare.query({ id: shareId });

  // Build an HTTP request to authz URL with correct params
  //  Throws on error or returns nothing and continues on success
  const authzParams = {
    ctx: shareData.ctx,
    key: shareData.key,
    user_id: shareData.user,
  };
  await rest.get.call(this, authzVerifier.url, authzParams);

  return undefined;
}

export default verifier;
