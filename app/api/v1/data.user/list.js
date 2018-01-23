import db from '../../../db/userData';

export default async function listHandler(requestor, owner) {
  this.logger.info(`data.user.list: requestor (${requestor}), owner (${owner})`);
  const list = await db.list.apply(this, [{
    owner,
    requestor,
  }]);


  return {
    keys: list.Items.map((item) => (item.key)),
  };
}
