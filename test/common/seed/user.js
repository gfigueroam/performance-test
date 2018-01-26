import http from '../helpers/http';
import paths from '../helpers/paths';

function unset(params, done) {
  if (!params.user || !params.key) {
    throw new Error('user and key are required parameters');
  }
  params.requestor = params.user;
  delete params.user;

  http.sendSeedRequest(paths.DATA_USER_DELETE, params, done);
}

function set(params, done) {
  if (!params.user || !params.key || !params.type || !params.data) {
    throw new Error('user, key, type, and data are required parameters');
  }
  params.requestor = params.user;
  delete params.user;

  http.sendSeedRequest(paths.DATA_USER_SET, params, done);
}

function unshare(params, done) {
  if (!params.id || !params.user) {
    throw new Error('id and user are require parameters');
  }
  params.requestor = params.user;
  delete params.user;

  http.sendSeedRequest(paths.DATA_USER_UNSHARE, params, done);
}

export default {
  set,
  unset,
  unshare,
};
