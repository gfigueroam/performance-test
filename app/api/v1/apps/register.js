import db from '../../../db/apps';

export default async function registerHandler(name, password, quota) {
  await db.register({
    name,
    password,
    quota,
  });

  return undefined;
}
