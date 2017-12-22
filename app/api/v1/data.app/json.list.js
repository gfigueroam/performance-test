import db from '../../../db/appData';

export default async function listHandler(app, user) {
  this.logger.info(`data.app.json.list: app (${app}), user (${user})`);
  const list = await db.listJson({
    app,
    user,
  });

  return {
    keys: list.Items.map((item) => (item.key)),
  };
}
