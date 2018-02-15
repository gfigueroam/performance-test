import db from '../../../db/userData';

export default async function getHandler(key, requestor, owner) {
  this.logger.info(`data.user.get: key (${key}), requestor (${requestor}), owner (${owner})`);

  const item = await db.get.apply(this, [{
    key,
    owner,
    requestor,
  }]);

  return item.Item ? {
    createdBy: item.Item.createdBy,
    data: item.Item.data,
    key,
    type: item.Item.type,
    updatedBy: item.Item.updatedBy,
  } : undefined;
}
