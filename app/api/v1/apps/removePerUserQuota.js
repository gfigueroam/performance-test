import db from '../../../db/apps';

export default async function removePerUserQuotaHandler(name) {
  this.logger.info(`apps.removePerUserQuotaHandler: name (${name})`);

  await db.removeQuota.apply(this, [{ name }]);
  return undefined;
}
