import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import koaBunyanLogger from 'koa-bunyan-logger';
import mount from 'koa-mount';
import serve from 'koa-static';

import swagger from 'swagger-koa';
import swatchKoa from 'swatchjs-koa';

import http from 'http';

import routes from '../router';
import config from '../config';
import metrics from '../metrics';
import logger from '../monitoring/logger';

import errorHandler from '../utils/error';
import uncaughtExceptionHandler from '../utils/exceptions';


function start(app) {
  // Initialize Prometheus gauges for CPU and system usage
  metrics.gauges.initialize();

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
  app.use(mount('/docs', serve('out/api/html')));

  const serverPort = config.get('server_port');
  const serverHostUrl = config.get('uds:url:primary');
  app.use(swagger.init({
    apiVersion: '1.0',
    basePath: `${serverHostUrl}:${serverPort}`,
    info: {
      description: 'Swagger + Koa = {swagger-koa}',
      title: 'Swagger Docs for UDS API',
    },
    swaggerJSON: 'static/swagger/api-docs.json',
    swaggerUI: 'static/swagger',
    swaggerURL: '/swagger',
    swaggerVersion: '2.0',
  }));

  logger.info('Initializing server...');

  // Init the server with request handlers
  const server = http.createServer(app.callback());

  // Bind to port from input argument and listen
  server.listen(serverPort, () => {
    logger.info(`Server is now listening on port: ${serverPort}`);
  });

  server.on('error', errorHandler);

  process.on('uncaughtException', uncaughtExceptionHandler);
}

export default {
  start,
};
