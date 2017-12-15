import db from '../../../db/userData';

export default async function getHandler(key, user) {
  this.logger.info(`data.user.get: key (${key}), user (${user})`);
  const item = await db.get({
    key,
    user,
  });

  return item.Item ? {
    data: item.Item.data,
    key,
    user,
  } : undefined;
}
