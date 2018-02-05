import db from '../../../db/appData';

export default async function listHandler(app, requestor, owner) {
  this.logger.info(`data.app.list: app (${app}), requestor (${requestor}), owner (${owner})`);
  const list = await db.list.apply(this, [{
    app,
    owner,
    requestor,
  }]);

  return list;
}
