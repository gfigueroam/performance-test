import db from '../../../db/calculatedBehavior';

export default async function getHandler(key, user) {
  this.logger.info(`data.cb.get: key (${key}), user (${user})`);
  const item = await db.get({
    key,
    user,
  });

  return item.Item ? item.Item.data : undefined;
}
