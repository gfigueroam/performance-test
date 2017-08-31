import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import koaBunyanLogger from 'koa-bunyan-logger';
import serve from 'koa-static-server';

import swatchKoa from 'swatchjs-koa';
import gridFramework from 'grid-framework';

import http from 'http';

import uuid from 'uuid';

import routes from './router';
import config from './config';
import metrics from './metrics';
import health from './monitoring/health';
import logger from './monitoring/logger';

import errorHandler from './utils/error';
import uncaughtExceptionHandler from './utils/exceptions';

// Boot the server using shared HMH Grid framework
const app = gridFramework({
  helmet: {
    csp: {
      server_host: 'localhost',
      defaultSrc: ["'self'"],
    },
  },
  health,
  validate_token: false, // Skip SIF token validation on all endpoints
});

// Add Prometheus metrics middleware to all inbound requests
app.use(metrics.middleware);

// Set up compress behavior for server responses
app.use(compress({}));

// Set up custom request logger using Bunyan
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestLogger({
  updateLogFields(fields) {
    fields.req = undefined;
    fields.res = undefined;
    fields.authorization = this.request.header.authorization;
    fields.correlationId = this.request.header.correlationid || uuid.v4();
  },
}));

// Parse and consume incoming POST parameters
app.use(bodyParser());

// Set up all routes defined for the app with their config/options
routes.forEach(route => {
  swatchKoa(app, route.routes, route.options);
});

// Set up static path to serve API documentation
//  API docs are available at: /docs/api.html
app.use(serve({
  rootPath: '/docs',
  rootDir: 'out/api/html',
}));

logger.info('Initializing server...');

// Init the server with request handlers
const server = http.createServer(app.callback());

// Bind to port from input argument and listen
const serverPort = config.get('server_port');
server.listen(serverPort, () => {
  logger.info(`Server is now listening on port: ${serverPort}`);
});

server.on('error', errorHandler);

process.on('uncaughtException', uncaughtExceptionHandler);

module.exports = server;
