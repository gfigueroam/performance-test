import chai from 'chai';

import metricsRoutes from '../../../../app/metrics/routes';

const expect = chai.expect;

describe('Metrics Routes', () => {
  it('should have expected number of routes declared', () => {
    expect(metricsRoutes.prefix).to.equal('');

    const routes = Object.keys(metricsRoutes.routes);
    expect(routes.length).to.equal(1);
  });
});
