import bunyan from 'bunyan';
import config from '../config';

const logger = bunyan.createLogger({
  environment: config.get('env'),
  application: 'uds',
  component: 'uds',
  name: 'uds',
  level: config.get('logger:level'),
});

export default logger;
