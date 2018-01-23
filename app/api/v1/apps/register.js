import db from '../../../db/apps';

export default async function registerHandler(name, quota) {
  this.logger.info(`apps.register: name (${name}), quota (${quota})`);
  await db.register.apply(this, [{
    name,
    quota,
  }]);

  return undefined;
}
