import chai from 'chai';
import sinon from 'sinon';

import runner from '../../../../app/kafka/runner';

const expect = chai.expect;

describe('consumer', () => {
  it('should skip starting the kafka consumer', () => {
    const startStub = sinon.stub(runner, 'start');

    // eslint-disable-next-line global-require
    require('../../../../app/kafka/consumer');

    expect(startStub.called).to.equal(false);

    startStub.restore();
  });
});
