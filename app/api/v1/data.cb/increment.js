import db from '../../../db/calculatedBehavior';

export default async function incrementHandler(key, user) {
  this.logger.info(`data.cb.increment: key (${key}), user (${user})`);
  const result = await db.atomicUpdate({
    key,
    user,
    value: 1,
  });

  return result;
}
