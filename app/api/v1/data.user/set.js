import db from '../../../db/userData';

export default async function setHandler(key, type, data, requestor, owner) {
  this.logger.info(`data.user.get: key (${key}), requestor (${requestor}), owner (${owner})`);
  await db.set.apply(this, [{
    data,
    key,
    owner,
    requestor,
    type,
  }]);

  return undefined;
}
