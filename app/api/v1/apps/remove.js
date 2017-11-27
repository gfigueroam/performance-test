import db from '../../../db/apps';

export default async function removeHandler(name) {
  this.logger.info(`apps.remove: name (${name})`);

  await db.remove({
    name,
  });

  return undefined;
}
