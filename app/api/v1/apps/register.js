import db from '../../../db/apps';

export default async function registerHandler(name, quota) {
  await db.register({
    name,
    quota,
  });

  return undefined;
}
