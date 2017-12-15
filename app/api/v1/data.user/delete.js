import db from '../../../db/userData';

export default async function deleteHandler(key, user) {
  this.logger.info(`data.user.get: key (${key}), user (${user})`);
  await db.unset({
    key,
    user,
  });

  return undefined;
}
