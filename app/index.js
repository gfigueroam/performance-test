import gridFramework from 'grid-framework';

import server from './server';
import health from './monitoring/health';


// Boot the server using shared HMH Grid framework
const app = gridFramework({
  health,
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
