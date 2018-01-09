import db from '../../../db/appData';

export default async function setHandler(key, data, app, user) {
  this.logger.info(`data.app.set: app (${app}), key (${key}), user (${user}), data ${data}`);
  await db.set({
    app,
    data,
    key,
    user,
  });

  return undefined;
}
