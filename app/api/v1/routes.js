import appsRoutes from './apps/api';
import authzRoutes from './authz/api';
import dataAdminRoutes from './data.admin/api';
import dataAppRoutes from './data.app/api';
import dataCBRoutes from './data.cb/api';
import dataUserRoutes from './data.user/api';

import logger from '../../monitoring/logger';


logger.info('routes: Adding api/v1 routes');

const prefix = 'api/v1';

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
  prefix,
  routes,
};
