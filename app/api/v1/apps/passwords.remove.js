import db from '../../../db/apps';

export default async function passwordsRemoveHandler(name, passwordId) {
  await db.removePassword({
    name,
    passwordId,
  });

  return undefined;
}
