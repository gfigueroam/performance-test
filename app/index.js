import common from 'hmh-bfm-nodejs-common';
import gridFramework from 'grid-framework';

import server from './server';


// Boot the server using shared HMH Grid framework
const app = gridFramework({
  health: common.monitoring.health,
  helmet: {
    csp: {
      connectSrc: ["'self' file:", 'http://localhost:5200/*'],
      defaultSrc: ["'self'"],
      fontSrc: ['*.gstatic.com'],
      imgSrc: ["'self' data:", '*.swagger.io'],
      server_host: 'localhost',
      styleSrc: ["'self'", "'unsafe-inline'", '*.googleapis.com'],
    },
  },
  validate_token: false, // Skip SIF token validation on all endpoints
});

server.start(app);
