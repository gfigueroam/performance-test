import db from '../../../db/calculatedBehavior';

export default async function getHandler(key, requestor, owner) {
  this.logger.info(`data.cb.get: key (${key}), requestor (${requestor}), owner (${owner})`);

  const item = await db.get.apply(this, [{
    key,
    owner,
    requestor,
  }]);
  return item.Item ? {
    createdBy: item.Item.createdBy,
    data: item.Item.data,
    key,
    updatedBy: item.Item.updatedBy,
  } : undefined;
}
