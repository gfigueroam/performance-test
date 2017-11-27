import db from '../../../db/calculatedBehavior';

export default async function incrementHandler(key, user) {
  this.logger.info(`data.cb.increment: key (${key}), user (${user})`);
  return db.atomicUpdate({
    key,
    user,
    value: 1,
  });
}
