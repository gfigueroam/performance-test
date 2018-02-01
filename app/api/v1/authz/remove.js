import db from '../../../db/authz';

export default async function removeHandler(name) {
  this.logger.info(`authz.remove: name (${name})`);

  await db.remove.apply(this, [{
    name,
  }]);
  return undefined;
}
