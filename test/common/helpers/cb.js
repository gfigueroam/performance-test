import http from './http';
import paths from './paths';


const OK = { ok: true };

function store(token, key, requestor) {
  return data => (new Promise((resolve, reject) => {
    const params = { data, key, requestor };
    http.sendPostRequestSuccess(paths.DATA_CB_SET, token, params, OK, err => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  }));
}

function retrieve(token, params) {
  return () => (new Promise((resolve, reject) => {
    http.sendPostRequest(paths.DATA_CB_GET, token, params, (err, res) => {
      if (err) {
        return reject(err);
      }
      if (!res.ok) {
        return reject(new Error(res.error));
      }
      return resolve(res.body);
    });
  }));
}

export default {
  retrieve,
  store,
};
