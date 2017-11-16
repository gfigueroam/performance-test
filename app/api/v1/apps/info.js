import db from '../../../db/apps';

export default async function infoHandler(name) {
  const app = await db.info({
    name,
  });

  return app;
}
