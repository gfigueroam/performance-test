import db from '../../../db/share';

export default async function unshareHandler(id, requestor, owner) {
  this.logger.info(`data.user.unshare: id (${id}), requestor (${requestor}), owner (${owner})`);
  await db.unshare.apply(this, [{
    id,
    owner,
    requestor,
  }]);
}
