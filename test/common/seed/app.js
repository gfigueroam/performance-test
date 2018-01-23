import http from '../helpers/http';
import paths from '../helpers/paths';
import tokens from '../helpers/tokens';

const OK = {
  ok: true,
};

function add(params) {
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

  params.requestor = params.user;
  delete params.user;

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.DATA_APP_SET, tokens.serviceToken, params, OK, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function remove(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }
  if (!params.app) {
    throw new Error('Parameter "app" is required.');
  }

  params.requestor = params.user;
  delete params.user;

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.DATA_APP_DELETE,
      tokens.serviceToken, params, OK, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
  });
}

export default {
  add,
  remove,
};
