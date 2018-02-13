import db from '../../../db/calculatedBehavior';

export default async function decrementHandler(key, requestor, owner) {
  this.logger.info(`data.cb.decrement: key (${key}), requestor (${requestor}), owner (${owner})`);

  await db.atomicUpdate.apply(this, [{
    key,
    owner,
    requestor,
    value: -1,
  }]);
  return undefined;
}
