import db from '../../../db/apps';

export default async function setPerUserQuotaHandler(name, quota) {
  this.logger.info(`apps.setPerUserQuota: name (${name}), quota (${quota})`);

  await db.setQuota.apply(this, [{
    name,
    quota,
  }]);
  return undefined;
}
