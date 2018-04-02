import common from 'hmh-bfm-nodejs-common';
import swatchjs from 'swatchjs';

import apiConfig from './api/v1/routes';

import onException from './utils/swatch';


const metricsConfig = common.metrics.routes;
const allConfigs = apiConfig.concat([metricsConfig]);

const allRoutes = allConfigs.map(config => ({
  options: {
    authAdapter: config.authAdapter,
    onException,
    prefix: config.prefix,
    rawResponse: config.rawResponse,
  },
  routes: swatchjs(config.routes),
}));

// Return all API and metrics endpoints for app router
export default allRoutes;
