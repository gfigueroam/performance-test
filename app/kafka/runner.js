/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
import request from 'request-promise';

import logger from '../monitoring/logger';

import schemas from './schemas';


function safeDeserializeMessage(buffer) {
  try {
    // First try to deserialize the message buffer exactly as received
    //  Should succeed when serializer wrote only the bytes of data object
    return schemas.cb.fromBuffer(buffer);
  } catch (error) {
    return undefined;
  }
}

function deserializeMessage(buffer) {
  // Try to deserialize message buffer exactly as received
  const result = safeDeserializeMessage(buffer);
  if (result !== undefined) {
    return result;
  }

  if (buffer[0] === 0x00) {
    // Confluence library have a wire format with a 0x00 as magic first byte
    //  followed by a four byte sequence of the registered schema identifier
    // Strip out the first five bytes from buffer and try to deserialize message
    logger.warn('Kafka consumer: Deserializing without Confluence prefix...');
    return safeDeserializeMessage(buffer.slice(5));
  }

  return undefined;
}

function start(config) {
  const consumer = config.initConsumer();
  const offset = config.initOffset(consumer);

  consumer.on('offsetOutOfRange', err => {
    // TODO: Handle this properly, warn on missed events, ensure offset is updated
    logger.warn('Kafka consumer: Warning! Offset out-of-range. Need to adjust client offset.', err);
  });

  consumer.on('message', message => {
    logger.info('Kafka consumer: Received a message:', message.offset);

    const buffer = message.value;
    const decodedMessage = deserializeMessage(buffer);
    if (!decodedMessage) {
      logger.error('Kafka consumer: Failed to deserialize message! Ignoring... ', message.offset, buffer);
      return;
    }

    // Convert Kafka event into UDS payload for API request
    logger.info('Kafka consumer: Decoded value: ', message.offset, decodedMessage);
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
        logger.info('Kafka consumer: UDS call succeeded! Commit processed event:', message.offset, udsPayload);
        const commit = {
          offset: message.offset + 1,
          partition: message.partition,
          topic: config.kafkaTopic,
        };
        offset.commit(config.kafkaGroupId, [commit], (err) => {
          if (err) {
            logger.error('Kafka consumer: Error committing offset: ', message.offset, err);
          } else {
            logger.info('Kafka consumer: Commit of offset was successful:', message.offset);
          }
        });
      } else {
        // TODO: Confirm Kafka will re-send the message after some visibility timeout
        logger.error('Kafka consumer: UDS call returned an error result!', message.offset, body);
      }
    }).catch(err => {
      // TODO: Confirm Kafka will re-send the message after some visibility timeout
      logger.error('Kafka consumer: UDS called failed!', message.offset, err);
    });
  });
}
/* eslint-enable promise/prefer-await-to-callbacks */
/* eslint-enable promise/prefer-await-to-then */

export default { start };
