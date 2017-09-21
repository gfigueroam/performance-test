import chai from 'chai';

import metricsMiddleware from '../../../../app/metrics/requests';
import metricsRoutes from '../../../../app/metrics/routes';

const expect = chai.expect;

describe('Metrics Requests', () => {
  it('should wrap requests and store metrics', () => {
    // Create mock object to simulate a koa ctx
    const mockCtx = {
      method: 'GET',
      path: 'test/endpoint',
      status: 200,
    };

    // Mock a handler that takes 200ms to do something
    const mockHandler = () => (
      Promise.resolve()
    );

    // Wait for the mock handler to complete and return
    const nextFn = async () => {
      await mockHandler();
    };

    metricsMiddleware(mockCtx, nextFn);

    // Loading metrics and calling route should add metrics data to Prometheus
    expect(metricsRoutes.routes.prometheus.handler()).not.to.equal('');
  });
});
