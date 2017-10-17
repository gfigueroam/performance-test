import swatchjs from 'swatchjs';

import apiRoutes from './api/v1/routes';
import metricsRoutes from './metrics/routes';

import onException from './utils/swatch';

const routeConfigs = apiRoutes.concat([metricsRoutes]);

const swatchRoutes = routeConfigs.map(config => ({
  options: {
    authAdapter: config.authAdapter,
    onException,
    prefix: config.prefix,
    rawResponse: config.rawResponse,
  },
  routes: swatchjs(config.routes),
}));

export default swatchRoutes;
