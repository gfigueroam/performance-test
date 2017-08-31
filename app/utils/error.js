import logger from '../monitoring/logger';

export default function errorHandler(error) {
  logger.error('An error occurred on the server: ', error);
  process.exit(1);
}
