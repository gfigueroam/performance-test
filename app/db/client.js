import common from 'hmh-bfm-nodejs-common';

import nconf from '../config';
import logger from '../monitoring/logger';
import metrics from '../models/metrics';


// Get the labels for the DB query and consumed capacity metrics
const labels = metrics.labels;

// Get the config for the database connection and optional IAM role
const config = {
  database: {
    apiVersion: nconf.get('database').apiVersion,
    region: nconf.get('database').region,
  },
};

const iamRole = nconf.get('iamRole');
if (iamRole) {
  config.iamRole = iamRole;
}

const endpoint = nconf.get('database').endpoint;
if (endpoint) {
  config.database.endpoint = endpoint;
}

// Check for optional credentials in non-production instances
const credentials = nconf.get('database').credentials;
if (credentials) {
  config.database.credentials = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  };
}

const client = common.dynamo.client.init(config, labels, logger);

export default client;
