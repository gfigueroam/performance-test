import appsRoutes from './apps/api';
import authzRoutes from './authz/api';
import dataAdminRoutes from './data.admin/api';
import dataAppRoutes from './data.app/api';
import dataCBRoutes from './data.cb/api';
import dataUserRoutes from './data.user/api';

// Bundle up all routes together and export as one configuration object
const allRoutes = Object.assign(
  {},
  appsRoutes,
  authzRoutes,
  dataAdminRoutes,
  dataAppRoutes,
  dataCBRoutes,
  dataUserRoutes,
);

export default allRoutes;
