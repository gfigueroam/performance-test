import db from '../../../db/calculatedBehavior';

export default async function setHandler(key, data, user) {
  return db.set({
    data,
    key,
    user,
  });
}
