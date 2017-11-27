import db from '../../../db/calculatedBehavior';

export default async function unsetHandler(key, user) {
  this.logger.info(`data.cb.unset: key (${key}), user (${user})`);
  return db.unset({
    key,
    user,
  });
}
