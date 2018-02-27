import cb from '../data.cb';
import constants from '../../../utils/constants';
import db from '../../../db/appData';

export default async function getHandler(key, app, requestor, owner) {
  this.logger.info(`data.app.get: app (${app}), key (${key}), requestor (${requestor}), owner (${owner})`);

  if (app === constants.CB_APP) {
    const cbResult = await cb.get.apply(this, [key, requestor, owner]);
    return cbResult;
  }

  const item = await db.get.apply(this, [{
    app,
    key,
    owner,
    requestor,
  }]);
  return item.Item ? {
    createdBy: item.Item.createdBy,
    data: item.Item.data,
    key,
    updatedBy: item.Item.updatedBy,
  } : undefined;
}
