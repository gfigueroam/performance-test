import db from '../../../db/calculatedBehavior';

export default async function mergeHandler(key, data, requestor, owner) {
  this.logger.info(`data.cb.merge: key (${key}), requestor (${requestor}), owner (${owner}), data (${data})`);

  const result = await db.merge.apply(this, [{
    data,
    key,
    owner,
    requestor,
  }]);
  return result;
}
