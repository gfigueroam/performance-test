import swatchjs from 'swatchjs';

import metricsRoutes from './metrics/routes';

const routeConfigs = [
  metricsRoutes,
];

const swatchRoutes = routeConfigs.map(config => ({
  routes: swatchjs(config.routes),
  options: {
    prefix: config.prefix,
  },
}));

export default swatchRoutes;
