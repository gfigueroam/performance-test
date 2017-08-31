import chai from 'chai';

import labels from '../../../../app/metrics/labels';

const expect = chai.expect;

describe('Metrics Labels', () => {
  it('should have expected number of routes declared', () => {
    expect(labels.application).to.equal('uds');
    expect(labels.stage).to.equal('test');
  });
});
