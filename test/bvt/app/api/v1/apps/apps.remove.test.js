import errors from '../../../../../../app/models/errors';
import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import constants from '../../../../../../app/utils/constants';

describe('apps.remove', () => {
  [constants.HMH_APP, constants.CB_APP].forEach((reservedApp) => {
    it(`should return error for reserved app named "${reservedApp}"`, done => {
      http.sendPostRequestError(paths.APPS_REMOVE, tokens.serviceToken, {
        name: reservedApp,
      }, errors.codes.ERROR_CODE_APP_NOT_FOUND, done);
    });
  });
});
