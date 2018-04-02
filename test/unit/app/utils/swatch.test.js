import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../app/models/errors';
import onException from '../../../../app/utils/swatch';

const expect = chai.expect;


describe('swatch', () => {
  it('should rethrow a known internal error code', () => {
    common.test.mute.muteTest(() => {
      const error = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
      expect(() => onException(error)).to.throw(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
    });
  });

  it('should rethrow an error with a known internal error code', () => {
    common.test.mute.muteTest(() => {
      const error = new Error(errors.codes.ERROR_CODE_AUTH_INVALID);
      expect(() => onException(error)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });
  });

  it('should throw a generic internal error for undefined error', () => {
    common.test.mute.muteTest(() => {
      const error = new Error('Some uncaught server exception');
      expect(() => onException(error)).to.throw(errors.codes.ERROR_CODE_INTERNAL_ERROR);
    });
  });

  it('should throw a generic internal error for undefined error', () => {
    common.test.mute.muteTest(() => {
      expect(() => onException()).to.throw(errors.codes.ERROR_CODE_INTERNAL_ERROR);
    });
  });
});
