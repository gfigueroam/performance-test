import gauges from './gauges';
import requests from './requests';

// Export the middleware functions to wrap requests and init gauges
export default {
  gauges,
  middleware: requests,
};
