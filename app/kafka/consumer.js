import util from 'util';

import config from './config';
import runner from './runner';

import logger from '../monitoring/logger';

// Main file to startup and initialize Kafka consumer
logger.info('Kafka consumer: Checking configuration...');

if (config.kafkaTopic && config.kafkaGroupId) {
  logger.info(`Kafka consumer start! Configuration: ${util.inspect(config)}`);

  runner.start(config);
}
