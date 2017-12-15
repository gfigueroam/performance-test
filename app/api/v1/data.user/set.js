import db from '../../../db/userData';

export default async function setHandler(key, type, data, user) {
  this.logger.info(`data.user.get: key (${key}), user (${user})`);
  await db.set({
    data,
    key,
    type,
    user,
  });

  return undefined;
}
