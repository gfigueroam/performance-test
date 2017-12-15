import http from '../helpers/http';
import paths from '../helpers/paths';

function unset(params, done) {
  if (!params.user || !params.key) {
    throw new Error('user and key are required parameters');
  }

  http.sendSeedRequest(paths.DATA_USER_DELETE, params, done);
}

function set(params, done) {
  if (!params.user || !params.key || !params.type || !params.data) {
    throw new Error('user, key, type, and data are required parameters');
  }

  http.sendSeedRequest(paths.DATA_USER_SET, params, done);
}

export default {
  set,
  unset,
};
