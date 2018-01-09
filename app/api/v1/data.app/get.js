import db from '../../../db/appData';

export default async function getHandler(key, app, user) {
  this.logger.info(`data.app.get: app (${app}), key (${key}), user (${user})`);
  const item = await db.get({
    app,
    key,
    user,
  });

  return item.Item ? {
    data: item.Item.data,
    key,
  } : undefined;
}
