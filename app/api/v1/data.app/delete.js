import cb from '../data.cb';
import constants from '../../../utils/constants';
import db from '../../../db/appData';

export default async function deleteHandler(key, app, requestor, owner) {
  this.logger.info(`data.app.delete: app (${app}), key (${key}), requestor (${requestor}), owner (${owner})`);

  if (app === constants.CB_APP) {
    await cb.unset.apply(this, [key, requestor, owner]);
  } else {
    await db.unset.apply(this, [{
      app,
      key,
      owner,
      requestor,
    }]);
  }
  return undefined;
}
