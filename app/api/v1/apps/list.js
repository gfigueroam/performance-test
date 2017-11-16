import db from '../../../db/apps';

export default async function listHandler() {
  const apps = await db.list();

  return apps;
}
