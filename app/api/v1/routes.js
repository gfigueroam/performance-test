import auth from '../../auth';
import logger from '../../monitoring/logger';

import appsRoutes from './apps/api';
import authzRoutes from './authz/api';
import dataAdminRoutes from './data.admin/api';
import dataAppRoutes from './data.app/api';
import dataCBRoutes from './data.cb/api';
import dataUserRoutes from './data.user/api';

const routes = Object.assign(
  {},
  appsRoutes,
  authzRoutes,
  dataAdminRoutes,
  dataAppRoutes,
  dataCBRoutes,
  dataUserRoutes,
);

const internalPrefix = 'api/v1';
const internalAuthAdapter = auth.adapter.internal;
const internalConfig = {
  authAdapter: internalAuthAdapter,
  prefix: internalPrefix,
  routes,
};

logger.info(`routes: Adding ${internalPrefix} routes with internal auth`);

const externalPrefix = 'uds/api/v1';
const externalAuthAdapter = auth.adapter.external;
const externalConfig = {
  authAdapter: externalAuthAdapter,
  prefix: externalPrefix,
  routes,
};

logger.info(`routes: Adding ${externalPrefix} routes with external auth`);

export default [
  internalConfig,
  externalConfig,
];
