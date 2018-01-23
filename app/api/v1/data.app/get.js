import db from '../../../db/appData';

export default async function getHandler(key, app, requestor, owner) {
  this.logger.info(`data.app.get: app (${app}), key (${key}), requestor (${requestor}), owner (${owner})`);
  const item = await db.get({
    app,
    key,
    owner,
    requestor,
  });

  return item.Item ? {
    data: item.Item.data,
    key,
  } : undefined;
}
