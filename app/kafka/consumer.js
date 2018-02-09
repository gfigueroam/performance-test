import util from 'util';

import config from './config';
import runner from './runner';

import logger from '../monitoring/logger';

if (config.kafkaTopic && config.kafkaGroupId) {
  logger.info(`Kafka consumer start! Configuration: ${util.inspect(config)}`);

  runner.start(config);
} else {
  logger.info('Kafka consumer: Skipping initialization...');
}
