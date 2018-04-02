import common from 'hmh-bfm-nodejs-common';

import nconf from '../../config';

const config = { env: nconf.get('env') };
const labels = common.metrics.labels.init('uds', config);

// Standard values to add as labels for all metrics
export default labels;
