import db from '../../../db/calculatedBehavior';

export default async function unsetHandler(key, user) {
  return db.unset({
    key,
    user,
  });
}
