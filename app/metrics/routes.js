import Prometheus from 'prom-client';

function metrics() {
  return Prometheus.register.metrics();
}

const routes = {
  prometheus: {
    handler: metrics,
  },
};

export default {
  routes,
  prefix: '',
};
