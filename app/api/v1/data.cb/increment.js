import db from '../../../db/calculatedBehavior';

export default async function incrementHandler(key, user) {
  return db.atomicUpdate({
    key,
    user,
    value: 1,
  });
}
