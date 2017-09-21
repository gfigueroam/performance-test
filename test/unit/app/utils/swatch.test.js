import chai from 'chai';

import errors from '../../../../app/models/errors';
import onException from '../../../../app/utils/swatch';

import mute from '../../../common/helpers/mute';

const expect = chai.expect;

describe('Swatch onException', () => {
  it('should rethrow a known internal error code', done => {
    mute.muteTest(() => {
      const error = new Error(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
      expect(() => onException(error)).to.throw(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
    }, done);
  });

  it('should throw a generic internal error for undefined error', done => {
    mute.muteTest(() => {
      const error = new Error('Some uncaught server exception');
      expect(() => onException(error)).to.throw(errors.codes.ERROR_CODE_INTERNAL_ERROR);
    }, done);
  });

  it('should throw a generic internal error for undefined error', done => {
    mute.muteTest(() => {
      expect(() => onException()).to.throw(errors.codes.ERROR_CODE_INTERNAL_ERROR);
    }, done);
  });
});
