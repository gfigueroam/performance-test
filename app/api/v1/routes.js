import auth from '../../auth';
import config from '../../config';
import logger from '../../monitoring/logger';

import appsRoutes from './apps/api';
import authzRoutes from './authz/api';
import dataAdminRoutes from './data.admin/api';
import dataAppRoutes from './data.app/api';
import dataCBRoutes from './data.cb/api';
import dataUserRoutes from './data.user/api';


// Dynamically look up the API prefix and auth adapter class
//  since some instances have LinkerD with alternate URL paths
const prefix = config.get('uds:api:prefix');

const adapterKey = config.get('uds:api:adapter');
const authAdapter = auth.adapter[adapterKey];

logger.info(`routes: Adding ${prefix} routes with ${adapterKey} auth`);

const routes = Object.assign(
  {},
  appsRoutes,
  authzRoutes,
  dataAdminRoutes,
  dataAppRoutes,
  dataCBRoutes,
  dataUserRoutes,
);

export default {
  authAdapter,
  prefix,
  routes,
};
