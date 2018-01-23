import db from '../../../db/calculatedBehavior';

export default async function setHandler(key, data, requestor, owner) {
  this.logger.info(`data.cb.set: key (${key}), requestor (${requestor}), owner (${owner}), data (${data})`);
  const result = await db.set.apply(this, [{
    data,
    key,
    owner,
    requestor,
  }]);

  return result;
}
