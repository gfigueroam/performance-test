import db from '../../../db/share';

export default async function shareHandler(key, authz, ctx, requestor, owner) {
  this.logger.info(`data.user.share: key (${key}), authz (${authz}), ctx (${ctx}), requestor (${requestor}), owner (${owner})`);
  const id = await db.share.apply(this, [{
    authz,
    ctx,
    key,
    owner,
    requestor,
  }]);

  return {
    id,
  };
}
