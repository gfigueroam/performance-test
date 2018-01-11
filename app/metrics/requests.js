import Prometheus from 'prom-client';

import labels from './labels';

// Track the number of requests to each endpoint
//  and a summary of the request duration for each
const labelKeys = Object.keys(labels);

const requestCount = new Prometheus.Counter(
  'http_request_count',
  'Request Count',
  labelKeys.concat(['method', 'path', 'status']),
);

const requestDuration = new Prometheus.Summary(
  'http_request_duration_seconds',
  'Request Duration',
  labelKeys.concat(['method', 'path']),
);


// Middleware function to wrap all requests and record
//  duration and outcome of the request from status code
export default async function middleware(ctx, next) {
  // Build labels for any info needed in both metrics
  const requestLabels = Object.assign(
    {},
    labels,
    { path: ctx.path },
    { method: ctx.method },
  );

  const endRequestDuration = requestDuration.startTimer(requestLabels);

  await next();

  // Mark the completed request duration and add to summary
  endRequestDuration();

  // Build labels and increment count for request endpoint metric
  const countLabels = Object.assign(
    {},
    requestLabels,
    { status: ctx.status },
  );
  requestCount.inc(countLabels);
}
