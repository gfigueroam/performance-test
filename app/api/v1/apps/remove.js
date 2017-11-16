import db from '../../../db/apps';

export default async function removeHandler(name) {
  await db.remove({
    name,
  });

  return undefined;
}
