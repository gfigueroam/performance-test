import util from 'util';

import common from 'hmh-bfm-nodejs-common';

import dynamo from './dynamo';

import metrics from '../../models/metrics';
import logger from '../../monitoring/logger';


// Track the duration of DB queries to biuld summary
const labels = metrics.labels;
const labelKeys = Object.keys(labels);

const Prometheus = common.metrics.client;
const queryDuration = new Prometheus.Summary(
  'db_query_duration_seconds',
  'DB Query Duration',
  labelKeys.concat(['table', 'action']),
);

const consumedCapacityCount = new Prometheus.Counter(
  'db_consumed_capacity_units',
  'DB Consumed Capacity',
  labelKeys.concat(['table', 'type']),
);


function getCapacityType(action) {
  const readActions = ['get', 'query', 'scan'];
  if (readActions.includes(action)) {
    return 'read';
  }
  return 'write';
}

export default async function instrumented(action, params) {
  const dynamodb = await dynamo.getClient();

  // Use built-in timer to track query duration for DB request
  const table = params.TableName;
  const dbLabels = Object.assign(
    {},
    labels,
    { table },
  );

  const queryLabels = Object.assign(
    {},
    dbLabels,
    { action },
  );
  const endQueryDuration = queryDuration.startTimer(queryLabels);

  // Execute query and await response
  const result = await dynamodb[action](params).promise();

  // Mark the completed query duration and add to summary
  endQueryDuration();

  // Increment the consumed capacity based on result of query
  const type = getCapacityType(action);
  const capLabels = Object.assign(
    {},
    dbLabels,
    { type },
  );

  const capacityObj = result.ConsumedCapacity || {};
  const consumedCapacity = capacityObj.CapacityUnits || 1;
  consumedCapacityCount.inc(capLabels, consumedCapacity);

  logger.info(`ConsumedCapacity for Dynamo query: ${util.inspect(result.ConsumedCapacity)}`);

  return result;
}
