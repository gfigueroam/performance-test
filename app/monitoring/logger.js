import bunyan from 'bunyan';
import config from '../config';

const logger = bunyan.createLogger({
  application: 'uds',
  component: 'uds',
  environment: config.get('env'),
  level: config.get('logger:level'),
  name: 'uds',
});

export default logger;
