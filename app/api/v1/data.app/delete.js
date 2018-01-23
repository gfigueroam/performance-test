import db from '../../../db/appData';

export default async function deleteHandler(key, app, requestor, owner) {
  this.logger.info(`data.app.delete: app (${app}), key (${key}), requestor (${requestor}), owner (${owner})`);
  await db.unset({
    app,
    key,
    owner,
    requestor,
  });

  return undefined;
}
