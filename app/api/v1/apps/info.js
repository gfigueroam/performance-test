import db from '../../../db/apps';

export default async function infoHandler(name) {
  this.logger.info(`apps.info: name (${name})`);

  const app = await db.info.apply(this, [{
    name,
  }]);
  return app;
}
