import http from '../helpers/http';
import paths from '../helpers/paths';
import tokens from '../helpers/tokens';

const OK = {
  ok: true,
};

function removeApps(apps) {
  return async () => (Promise.all(apps.map((name) => (
    new Promise((resolve, reject) => {
      const params = {
        name,
      };
      http.sendPostRequestSuccess(paths.APPS_REMOVE, tokens.serviceToken, params, {
        ok: true,
      }, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }))))
  );
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
