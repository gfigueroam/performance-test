import db from '../../../db/calculatedBehavior';

export default async function mergeHandler(key, data, user) {
  return db.merge({
    data,
    key,
    user,
  });
}
