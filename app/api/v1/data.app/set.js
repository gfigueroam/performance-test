import db from '../../../db/appData';

export default async function setHandler(key, data, app, requestor, owner) {
  this.logger.info(`data.app.set: app (${app}), key (${key}), requestor (${requestor}), owner (${owner}), data ${data}`);

  await db.set.apply(this, [{
    app,
    data,
    key,
    owner,
    requestor,
  }]);
  return undefined;
}
