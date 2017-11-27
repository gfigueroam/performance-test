import db from '../../../db/calculatedBehavior';

export default async function decrementHandler(key, user) {
  this.logger.info(`data.cb.decrement: key (${key}), user (${user})`);
  return db.atomicUpdate({
    key,
    user,
    value: -1,
  });
}
