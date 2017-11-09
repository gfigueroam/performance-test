import http from '../helpers/http';
import paths from '../helpers/paths';

function unset(params, done) {
  if (!params.user || !params.key) {
    throw new Error('user and key are required parameters');
  }

  http.sendSeedRequest(paths.DATA_CB_UNSET, params, done);
}

export default {
  unset,
};
