import config from '../config';

// Standard values to add as labels for all metrics
export default {
  application: 'uds',
  stage: config.get('env'),
};
