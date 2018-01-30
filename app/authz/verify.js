import dbAuthz from '../db/authz';
import rest from '../utils/rest';

import simple from './simple';

const defaultAuthz = {
  uds_authz_allow: simple.allow,
  uds_authz_deny: simple.deny,
};

async function verify(shareId, requestor, shareItem) {
  this.logger.info(`Authz module verifying item '${shareId}' with share metadata '${shareItem}'`);

  const authz = shareItem.authz;

  // Check whether the authz key is a known internal type
  if (defaultAuthz[authz]) {
    await defaultAuthz[authz](shareId);
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
  await rest.get.call(this, authzVerifier.url, authzParams);

  return undefined;
}

export default verify;
