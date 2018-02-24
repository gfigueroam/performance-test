/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
import request from 'request-promise';

import logger from '../monitoring/logger';

import schemas from './schemas';


function start(config) {
  const consumer = config.initConsumer();
  const offset = config.initOffset(consumer);

  consumer.on('offsetOutOfRange', err => {
    // TODO: Handle this properly, warn on missed events, ensure offset is updated
    logger.warn('Kafka consumer: Warning! Offset out-of-range. Need to adjust client offset.', err);
  });

  consumer.on('message', message => {
    logger.info('Kafka consumer: Received a message!');
    const decodedMessage = schemas.cb.fromBuffer(message.value);

    // Convert Kafka event into UDS payload for API request
    logger.info('Kafka consumer: Decoded value: ', decodedMessage);
    const udsPayload = {
      key: decodedMessage.key,
      owner: decodedMessage.user,
      requestor: decodedMessage.user,
    };
    if (decodedMessage.data) {
      udsPayload.data = decodedMessage.data;
    }

    // Call the correct UDS endpoint with event paylaod
    const uri = `${config.udsBaseUrl}.${decodedMessage.operation}`;

    request.post({
      headers: config.udsHeaders,
      json: udsPayload,
      uri,
    }).then(body => {
      if (body.ok) {
        // Commit the event by offset after processing successfully
        logger.info(`Kafka consumer: UDS call succeeded! Commit processed event: ${udsPayload}`);
        const commit = {
          offset: message.offset + 1,
          partition: message.partition,
          topic: config.kafkaTopic,
        };
        offset.commit(config.kafkaGroupId, [commit], (err, data) => {
          if (err) {
            logger.error('Kafka consumer: Error committing offsets: ', err);
          } else {
            logger.info('Kafka consumer: Commit of offset was successful. Data:', data);
          }
        });
      } else {
        // TODO: Confirm Kafka will re-send the message after some visibility timeout
        logger.error('Kafka consumer: UDS call returned an error result!', body);
      }
    }).catch(err => {
      // TODO: Confirm Kafka will re-send the message after some visibility timeout
      logger.error('Kafka consumer: UDS called failed!', err);
    });
  });
}
/* eslint-enable promise/prefer-await-to-callbacks */
/* eslint-enable promise/prefer-await-to-then */

export default { start };
