import db from '../../../db/share';

export default async function getSharedHandler(requestor, id) {
  this.logger.info(`data.user.getShared: requestor (${requestor}), id (${id})`);

  const result = await db.getShared.apply(this, [{ id, requestor }]);
  return result;
}
