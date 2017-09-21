import Prometheus from 'prom-client';

function metrics() {
  return Prometheus.register.metrics();
}

// Metrics endpoint (/prometheus) should return the exact
//  structured data from the Prometheus client, so we
//  register the endpoint with swatch but skip metadata
const prefix = '';
const rawResponse = true;

const routes = {
  prometheus: {
    handler: metrics,
  },
};

export default {
  prefix,
  rawResponse,
  routes,
};
