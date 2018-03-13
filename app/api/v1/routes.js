import auth from '../../auth';
import logger from '../../monitoring/logger';

import batchConfig from './batch';
import routesConfig from './config';

const batchEndpoint = true;

const routes = Object.assign(
  {},
  batchConfig,
  routesConfig,
);

const internalPrefix = 'api/v1';
const internalAuthAdapter = auth.adapter.external;
const internalConfig = {
  authAdapter: internalAuthAdapter,
  batchEndpoint,
  prefix: internalPrefix,
  routes,
};

logger.info(`routes: Adding ${internalPrefix} routes with external auth`);

const externalPrefix = 'uds/api/v1';
const externalAuthAdapter = auth.adapter.external;
const externalConfig = {
  authAdapter: externalAuthAdapter,
  batchEndpoint,
  prefix: externalPrefix,
  routes,
};

logger.info(`routes: Adding ${externalPrefix} routes with external auth`);

export default [
  internalConfig,
  externalConfig,
];
