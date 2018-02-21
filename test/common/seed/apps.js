import http from '../helpers/http';
import paths from '../helpers/paths';
import tokens from '../helpers/tokens';

const OK = {
  ok: true,
};

async function removeApp(name) {
  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(
      paths.APPS_REMOVE,
      tokens.serviceToken,
      { name },
      { ok: true },
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      },
    );
  });
}

async function removeApps(apps) {
  await Promise.all(apps.map(async name => {
    await removeApp(name);
  }));
}

function addApp(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.quota === undefined) {
    throw new Error('Parameter "quota" is required.');
  }

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.APPS_REGISTER, tokens.serviceToken, params, OK, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}
export default {
  addApp,
  removeApps,
};
