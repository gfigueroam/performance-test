import db from '../../../db/calculatedBehavior';

export default async function unsetHandler(key, user) {
  this.logger.info(`data.cb.unset: key (${key}), user (${user})`);
  const result = await db.unset({
    key,
    user,
  });

  return result;
}
