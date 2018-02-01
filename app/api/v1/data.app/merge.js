import db from '../../../db/appData';

export default async function mergeHandler(key, data, app, requestor, owner) {
  this.logger.info(`data.app.merge: app (${app}), key (${key}), requestor (${requestor}), owner (${owner}), data ${data}`);

  const result = await db.merge.apply(this, [{
    app,
    data,
    key,
    owner,
    requestor,
  }]);
  return {
    data: result,
    key,
  };
}
