import Prometheus from 'prom-client';

import labels from './labels';

// Track the number of requests to each endpoint
//  and a histogram of the request duration for each
const labelKeys = Object.keys(labels);

const requestCount = new Prometheus.Counter(
  'http_request_count',
  'Request Count',
  labelKeys.concat(['method', 'path', 'status']),
);

const requestDuration = new Prometheus.Histogram(
  'http_request_duration_seconds',
  'Request Duration',
  labelKeys.concat(['method', 'path']),
);


// Middleware function to wrap all requests and record
//  duration and outcome of the request from status code
export default async function middleware(ctx, next) {
  const start = process.hrtime();

  await next();

  // Build labels for any info needed in both metrics
  const requestLabels = Object.assign(
    {},
    labels,
    { path: ctx.path },
    { method: ctx.method },
  );

  // Calculate duration of request in nano-seconds
  const duration = process.hrtime(start);
  const requestLength = (duration[0] * 1e9) + duration[1];
  requestDuration.observe(requestLabels, requestLength);

  const countLabels = Object.assign(
    {},
    requestLabels,
    { status: ctx.status },
  );
  requestCount.inc(countLabels);
}
