import chai from 'chai';

import metrics from '../../../../app/models/metrics';

const expect = chai.expect;


describe('system.metrics', () => {
  it('should have basic labels defined', () => {
    expect(metrics.labels.application).to.equal('uds');
    expect(metrics.labels.stage).to.equal('test');
  });
});
