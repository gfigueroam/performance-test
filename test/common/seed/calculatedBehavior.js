import http from '../helpers/http';
import paths from '../helpers/paths';

function unset(params, done) {
  if (!params.user || !params.key) {
    throw new Error('user and key are required parameters');
  }
  params.requestor = params.user;
  delete params.user;

  http.sendSeedRequest(paths.DATA_CB_UNSET, params, done);
}

export default {
  unset,
};
