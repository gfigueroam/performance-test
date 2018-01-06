import db from '../../../db/authz';

export default async function infoHandler(name) {
  this.logger.info(`authz.info: name (${name})`);

  const authz = await db.info({
    name,
  });

  return authz;
}
