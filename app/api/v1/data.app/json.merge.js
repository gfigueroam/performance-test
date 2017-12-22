import db from '../../../db/appData';

export default async function mergeHandler(key, data, app, user) {
  this.logger.info(`data.app.json.merge: app (${app}), key (${key}), user (${user}), data ${data}`);
  const result = await db.mergeJson({
    app,
    data,
    key,
    user,
  });

  return {
    data: result,
    key,
  };
}
