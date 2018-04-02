import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';


const path = paths.DATA_CB_INCREMENT;
const serviceToken = common.test.tokens.serviceToken;

const key = `uds.bvt.swatch.bvt.test.${seed.buildNumber}`;
const user = `data.admin.test.user.${seed.buildNumber}`;


describe('uds.swatchjs', () => {
  it('returns "invalid_arg_name" error (not "internal_error") when unexpected argument is present', done => {
    const params = {
      data: 'some data',
      key,
      user,
    };
    const errorCode = errors.codes.ERROR_CODE_INVALID_ARG_NAME;
    const errorDetails = 'Unexpected argument "data".';
    http.sendPostRequestErrorDetails(path, serviceToken, params, errorCode, errorDetails, done);
  });
});
