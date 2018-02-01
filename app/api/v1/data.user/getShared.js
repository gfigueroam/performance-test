import db from '../../../db/share';

export default async function getSharedHandler(id, requestor) {
  this.logger.info(`data.user.getShared: id (${id}), requestor (${requestor})`);

  const result = await db.getShared.apply(this, [{ id, requestor }]);
  return result;
}
