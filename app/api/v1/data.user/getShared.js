import db from '../../../db/share';

export default async function getSharedHandler(id) {
  this.logger.info(`data.user.getShared: id (${id})`);

  const result = await db.getShared.apply(this, [{ id }]);
  return result;
}
