import db from '../../../db/apps';

export default async function setPerUserQuotaHandler(name, quota) {
  await db.setQuota({
    name,
    quota,
  });

  return undefined;
}
