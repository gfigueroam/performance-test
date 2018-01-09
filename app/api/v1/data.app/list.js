import db from '../../../db/appData';

export default async function listHandler(app, user) {
  this.logger.info(`data.app.list: app (${app}), user (${user})`);
  const list = await db.list({
    app,
    user,
  });

  return {
    keys: list.Items.map((item) => (item.key)),
  };
}
