import util from 'util';

import logger from '../monitoring/logger';

export default function uncaughtExceptionHandler(error) {
  logger.error(util.inspect(error));
  logger.error(`UncaughtException: ${JSON.stringify(error)}`);
}
