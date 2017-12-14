import db from '../../../db/calculatedBehavior';

export default async function setHandler(key, data, user) {
  this.logger.info(`data.cb.set: key (${key}), user (${user}), data (${data})`);
  const result = await db.set({
    data,
    key,
    user,
  });

  return result;
}
