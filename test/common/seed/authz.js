import common from 'hmh-bfm-nodejs-common';

import http from '../helpers/http';
import paths from '../helpers/paths';


const serviceToken = common.test.tokens.serviceToken;

const OK = { ok: true };

function addAuthz(params) {
  if (!params.name) {
    throw new Error('Parameter "name" is required.');
  }
  if (params.url === undefined) {
    throw new Error('Parameter "url" is required.');
  }

  return new Promise((resolve, reject) => {
    http.sendPostRequestSuccess(paths.AUTHZ_REGISTER, serviceToken, params, OK, err => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function removeAuthz(authzs) {
  return async () => (Promise.all(authzs.map((name) => (
    new Promise((resolve, reject) => {
      const params = { name };
      http.sendPostRequestSuccess(paths.AUTHZ_REMOVE, serviceToken, params, OK, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }))))
  );
}

export default {
  addAuthz,
  removeAuthz,
};
