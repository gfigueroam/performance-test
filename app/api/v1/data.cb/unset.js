import db from '../../../db/calculatedBehavior';

export default async function unsetHandler(key, requestor, owner) {
  this.logger.info(`data.cb.unset: key (${key}), requestor (${requestor}), owner (${owner})`);
  const result = await db.unset({
    key,
    owner,
    requestor,
  });

  return result;
}
