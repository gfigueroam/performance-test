import db from '../../../db/calculatedBehavior';

export default async function getHandler(key, user) {
  const item = await db.get({
    key,
    user,
  });

  return item.Item.data;
}
