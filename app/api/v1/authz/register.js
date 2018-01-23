import db from '../../../db/authz';

export default async function registerHandler(name, url) {
  this.logger.info(`authz.register: name (${name}), url (${url})`);
  await db.register.apply(this, [{
    name,
    url,
  }]);

  return undefined;
}
