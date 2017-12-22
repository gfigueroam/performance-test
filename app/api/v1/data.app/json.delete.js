import db from '../../../db/appData';

export default async function deleteHandler(key, app, user) {
  this.logger.info(`data.app.json.delete: app (${app}), key (${key}), user (${user})`);
  await db.unsetJson({
    app,
    key,
    user,
  });

  return undefined;
}
