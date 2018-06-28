import chai from 'chai';
import sinon from 'sinon';

import runner from '../../../../app/kafka/runner';

const expect = chai.expect;


describe('consumer', () => {
  before(() => {
    sinon.stub(runner, 'start');
  });

  after(() => {
    runner.start.restore();
  });

  it('should skip starting the kafka consumer', () => {
    // eslint-disable-next-line global-require
    require('../../../../app/kafka/consumer');

    expect(runner.start.called).to.equal(false);
  });
});
