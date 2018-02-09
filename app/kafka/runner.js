/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
import request from 'request-promise';

import logger from '../monitoring/logger';

import schemas from './schemas';


const commits = [];
const eventCommitInterval = 2000;

function start(config) {
  const consumer = config.initConsumer();
  const offset = config.initOffset(consumer);

  // Periodically update consumer offset to commit processed messages
  function commitMessages() {
    if (commits.length > 0) {
      logger.info('Kafka consumer: Committing successfully handled events: ', commits);

      offset.commit(config.kafkaGroupId, commits, (err, data) => {
        if (err) {
          logger.error('Kafka consumer: Error committing offsets: ', err);
          return;
        }

        logger.info('Kafka consumer: Commit of offsets was successful. Data = ', data);

        // Truncate the commits array.
        commits.length = 0;
      });
    }
    setTimeout(commitMessages, eventCommitInterval);
  }

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
        // Push the offset into the commits array which periodically is commited
        logger.info(`Kafka consumer: UDS call succeeded! Adding event to pending commit list: ${udsPayload}`);
        commits.push({
          offset: message.offset + 1,
          partition: message.partition,
          topic: config.kafkaTopic,
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

  // Start periodic loop to commit handled events
  setTimeout(commitMessages, eventCommitInterval);
}
/* eslint-enable promise/prefer-await-to-callbacks */
/* eslint-enable promise/prefer-await-to-then */

export default { start };
