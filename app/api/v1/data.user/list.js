import db from '../../../db/userData';

export default async function listHandler(user) {
  this.logger.info(`data.user.list: user (${user})`);
  const list = await db.list({
    user,
  });


  return {
    keys: list.Items.map((item) => (item.key)),
  };
}
