import db from '../../../db/userData';

export default async function queryHandler(keyPrefix, requestor, owner) {
  this.logger.info(`data.user.query: key (${keyPrefix}), requestor (${requestor}), owner (${owner})`);

  const retVal = await db.query.apply(this, [{
    keyPrefix,
    owner,
    requestor,
  }]);
  return retVal.Items ? retVal.Items.map(item => ({
    createdBy: item.createdBy,
    data: item.data,
    key: item.key,
    type: item.type,
    updatedBy: item.updatedBy,
    user: item.user,
  })) : undefined;
}
