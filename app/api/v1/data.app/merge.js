import cb from '../data.cb';
import constants from '../../../utils/constants';
import db from '../../../db/appData';

export default async function mergeHandler(key, data, app, requestor, owner) {
  this.logger.info(`data.app.merge: app (${app}), key (${key}), requestor (${requestor}), owner (${owner}), data ${data}`);

  if (app === constants.CB_APP) {
    const cbResult = await cb.merge.apply(this, [key, data, requestor, owner]);
    return cbResult;
  }

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
