import chai from 'chai';
import sinon from 'sinon';

import mute from '../../../../test/common/helpers/mute';

import errorHandler from '../../../../app/utils/error';

const expect = chai.expect;

describe('Error Utilities', () => {
  describe('errorHandler', () => {
    let processStub;

    before(() => {
      // Stub out process.exit method before these tests
      processStub = sinon.stub(process, 'exit');
    });

    after(() => {
      // Drop all stubs as soon as tests are done
      process.exit.restore();
    });

    it('should log error message and exist', (done) => {
      mute.muteTest(() => {
        let wasHandlerCalled = false;
        processStub.callsFake((arg) => {
          expect(arg).to.equal(1);
          wasHandlerCalled = true;
        });

        const error = new Error('Server explosion');
        errorHandler(error);

        expect(wasHandlerCalled).to.equal(true);
      }, done);
    });
  });
});
