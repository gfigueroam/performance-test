import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import koaBunyanLogger from 'koa-bunyan-logger';
import serve from 'koa-static-server';

import swatchKoa from 'swatchjs-koa';
import gridFramework from 'grid-framework';

import http from 'http';

import routes from './router';
import config from './config';
import metrics from './metrics';
import health from './monitoring/health';
import logger from './monitoring/logger';

import errorHandler from './utils/error';
import uncaughtExceptionHandler from './utils/exceptions';

// Boot the server using shared HMH Grid framework
const app = gridFramework({
  health,
  helmet: {
    csp: {
      defaultSrc: ["'self'"],
      server_host: 'localhost',
    },
  },
  validate_token: false, // Skip SIF token validation on all endpoints
});

// Add Prometheus metrics middleware to all inbound requests
app.use(metrics.middleware);

// Set up compress behavior for server responses
app.use(compress({}));

// Set up custom request logger using Bunyan
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestIdContext({
  field: 'correlationId',
  prop: 'correlationId',
  requestProp: 'correlationId',
}));
app.use(koaBunyanLogger.requestLogger({
  updateLogFields(fields) {
    fields.req = undefined;
    fields.res = undefined;
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
  rootDir: 'out/api/html',
  rootPath: '/docs',
}));

// UDS does not use Swagger, but we redirect from /swagger to our /docs
//  endpoint to stay consistent with other HMH services using Swagger
app.use(serve({
  rootDir: 'static/swagger',
  rootPath: '/swagger',
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
