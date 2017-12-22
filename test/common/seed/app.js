import http from '../helpers/http';
import paths from '../helpers/paths';
import tokens from '../helpers/tokens';

const OK = {
  ok: true,
};

function addJson(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.data) {
    throw new Error('Parameter "data" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.DATA_APP_JSON_SET, tokens.serviceToken, params, OK, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function removeJson(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.DATA_APP_JSON_DELETE,
      tokens.serviceToken, params, OK, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
  });
}

export default {
  addJson,
  removeJson,
};
