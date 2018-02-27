import cb from '../data.cb';
import constants from '../../../utils/constants';
import db from '../../../db/appData';

export default async function queryHandler(keyPrefix, app, requestor, owner) {
  this.logger.info(`data.app.query: key (${keyPrefix}), app (${app}), requestor (${requestor}), owner (${owner})`);

  if (app === constants.CB_APP) {
    const cbResult = await cb.query.apply(this, [keyPrefix, requestor, owner]);
    return cbResult;
  }

  const retVal = await db.query.apply(this, [{
    app,
    keyPrefix,
    owner,
    requestor,
  }]);

  return retVal ? retVal.map(item => ({
    app,
    createdBy: item.createdBy,
    data: item.data,
    key: item.key,
    updatedBy: item.updatedBy,
  })) : undefined;
}
