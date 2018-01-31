import db from '../../../db/appData';

export default async function queryHandler(keyPrefix, app, requestor, owner) {
  this.logger.info(`data.app.query: key (${keyPrefix}), app (${app}), requestor (${requestor}), owner (${owner})`);
  const retVal = await db.query.apply(this, [{
    app,
    keyPrefix,
    owner,
    requestor,
  }]);

  return retVal.Items ? retVal.Items.map(item => ({
    app,
    data: item.data,
    key: item.key,
    user: item.user,
  })) : undefined;
}