import requests from './requests';

// Require file to initialize gauges refresh interval
require('./gauges');

// Export the middleware functions to wrap all requests
export default {
  middleware: requests,
};
