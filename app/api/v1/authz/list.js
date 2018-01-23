import db from '../../../db/authz';

export default async function listHandler() {
  this.logger.info('authz.list');
  const authz = await db.list.apply(this);

  return authz;
}
