import db from '../../../db/appData';

export default async function getHandler(key, app, user) {
  this.logger.info(`data.app.json.get: app (${app}), key (${key}), user (${user})`);
  const item = await db.getJson({
    app,
    key,
    user,
  });

  return item.Item ? {
    data: item.Item.data,
    key,
  } : undefined;
}
