import db from '../../../db/calculatedBehavior';

export default async function decrementHandler(key, user) {
  return db.atomicUpdate({
    key,
    user,
    value: -1,
  });
}
