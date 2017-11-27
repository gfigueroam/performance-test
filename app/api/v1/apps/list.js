import db from '../../../db/apps';

export default async function listHandler() {
  this.logger.info(`apps.list`);
  const apps = await db.list();

  return apps;
}
