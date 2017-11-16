import db from '../../../db/apps';

export default async function passwordsAddHandler(name, password) {
  const id = await db.addPassword({
    name,
    password,
  });

  return {
    id,
  };
}
