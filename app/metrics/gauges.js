import pidusage from 'pidusage';
import Prometheus from 'prom-client';

import labels from './labels';

// Create standard CPU and memory gauge metrics
const cpuGauge = new Prometheus.Gauge(
  'process_cpu_usage_percent',
  'Process CPU usage (%)',
  Object.keys(labels),
);
const memoryGauge = new Prometheus.Gauge(
  'process_memory_usage_bytes',
  'Process memory usage (bytes)',
  Object.keys(labels),
);

// Execute function to initialize data-collection interval
setInterval(() => {
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  pidusage.stat(process.pid, (error, stat) => {
    if (!error) {
      cpuGauge.set(labels, stat.cpu);
      memoryGauge.set(labels, stat.memory);
    }
  });
}, 500);
