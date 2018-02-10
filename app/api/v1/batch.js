import swatchjs from 'swatchjs';
import batch from 'swatchjs-batch-koa';

import logger from '../../monitoring/logger';
import middleware from '../../middleware';

import routesConfig from './config';

// Use swatch to generate handlers for all API routes
const allRoutes = swatchjs(routesConfig);

// Create a new route with the batch handler with its own schema
//  Expects one param (list of operations called `ops`) and should
//   check for database consistency and at least validate token first
//  The batch handler will take care of executing all requested ops
const batchConfig = {
  batch: {
    args: [
      {
        name: 'ops',
        optional: false,
      },
    ],
    handler: batch(allRoutes),
    metadata: {
      middleware: [
        middleware.database.ensureReadConsistency,
        middleware.auth.requireUserOrServiceToken,
      ],
    },
  },
};

logger.info('routes: Building batch route for UDS API');

export default batchConfig;
