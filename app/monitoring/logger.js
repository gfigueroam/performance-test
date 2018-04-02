import common from 'hmh-bfm-nodejs-common';

import nconf from '../config';

const config = {
  env: nconf.get('env'),
  level: nconf.get('logger:level'),
};

const logger = common.monitoring.logger.init('uds', config);

export default logger;
