import chai from 'chai';
import sinon from 'sinon';

import Prometheus from 'prom-client';

import metrics from '../../../../app/metrics';

const expect = chai.expect;

describe('Gauges', () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

  it('should initialize a CPU and memory gauges to execute periodically', () => {
    const pName = 'process_cpu_usage_percent';
    const bName = 'process_memory_usage_bytes';

    // Initially there should be no metrics configured
    expect(Prometheus.register.getSingleMetric(pName)).to.equal(undefined);
    expect(Prometheus.register.getSingleMetric(bName)).to.equal(undefined);

    // Initialize the gauges so we can test initialization and callback
    metrics.gauges.initialize();

    expect(Prometheus.register.getSingleMetric(pName).name).to.equal(pName);
    expect(Prometheus.register.getSingleMetric(bName).name).to.equal(bName);

    // Fake-advance the clock past 500 ms so it will execute one interval
    clock.tick(1000);

    // Gauges are still available and should have executed
    expect(Prometheus.register.getSingleMetric(pName).name).to.equal(pName);
    expect(Prometheus.register.getSingleMetric(bName).name).to.equal(bName);
  });
});
