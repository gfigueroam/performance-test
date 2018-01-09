import db from '../../../db/appData';

export default async function deleteHandler(key, app, user) {
  this.logger.info(`data.app.delete: app (${app}), key (${key}), user (${user})`);
  await db.unset({
    app,
    key,
    user,
  });

  return undefined;
}
