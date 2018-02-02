import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const key = `uds.bvt.data.cb.increment.test.${seed.buildNumber}`;
const user = `data.admin.test.user.${seed.buildNumber}`;

describe('swatchjs', () => {
  it('returns "invalid_arg_name" error (not "internal_error") when unexpected argument is present', done => {
    http.sendPostRequestErrorDetails(paths.DATA_CB_INCREMENT, tokens.serviceToken, {
      data: 'some data',
      key,
      user,
    }, 'invalid_arg_name', 'Unexpected argument "data".', done);
  });
});
