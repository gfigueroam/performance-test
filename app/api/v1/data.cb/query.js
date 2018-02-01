import db from '../../../db/calculatedBehavior';

export default async function queryHandler(keyPrefix, requestor, owner) {
  this.logger.info(`data.cb.query: key (${keyPrefix}), requestor (${requestor}), owner (${owner})`);

  const items = await db.query.apply(this, [{
    keyPrefix,
    owner,
    requestor,
  }]);
  return items;
}
