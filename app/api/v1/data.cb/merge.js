import db from '../../../db/calculatedBehavior';

export default async function mergeHandler(key, data, user) {
  this.logger.info(`data.cb.merge: key (${key}), user (${user}), data (${data})`);
  const result = await db.merge({
    data,
    key,
    user,
  });

  return result;
}
