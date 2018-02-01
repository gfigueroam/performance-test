import db from '../../../db/appData';

export default async function appsHandler(user) {
  this.logger.info(`data.admin.apps: user (${user})`);

  const apps = await db.getApps.apply(this, [{
    user,
  }]);
  return apps;
}
