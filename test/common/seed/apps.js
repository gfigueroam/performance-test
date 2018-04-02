import common from 'hmh-bfm-nodejs-common';

import http from '../helpers/http';
import paths from '../helpers/paths';


const serviceToken = common.test.tokens.serviceToken;

const OK = { ok: true };

async function removeApp(name) {
  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(
      paths.APPS_REMOVE,
      serviceToken,
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
    http.sendPostRequestSuccess(
      paths.APPS_REGISTER,
      serviceToken,
      params,
      OK,
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      },
    );
  });
}
export default {
  addApp,
  removeApps,
};
