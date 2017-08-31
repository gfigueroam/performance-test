import mute from '../../../common/helpers/mute';

import uncaughtExceptionHandler from '../../../../app/utils/exceptions';

describe('Exceptions Utilities', () => {
  describe('uncaughtExceptionHandler', () => {
    it('should log exception messages', (done) => {
      mute.muteTest(() => {
        const error = new Error('Some uncaught server exception');
        uncaughtExceptionHandler(error);
      }, done);
    });
  });
});
