import db from '../../../db/userData';

export default async function deleteHandler(key, requestor, owner) {
  this.logger.info(`data.user.get: key (${key}), requestor (${requestor}), owner (${owner})`);
  await db.unset.apply(this, [{
    key,
    owner,
    requestor,
  }]);

  return undefined;
}
