/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
import kafka from 'kafka-node';
import request from 'request-promise';

import config from '../config';
import logger from '../monitoring/logger';

import schemas from './schemas';


let offset;
let consumer;

const commits = [];
const eventCommitInterval = 2000;

const cbSchema = schemas.calculatedBehavior;

const kafkaHost = config.get('kafka:host');
const kafkaTopic = config.get('kafka:topic');
const groupId = config.get('kafka:group_id');

// Get the active server port from configuration
const serverPort = config.get('server_port');
const udsHost = `http://localhost:${serverPort}`;

// Use a fixed service token for internal UDS API requests
const serviceToken = config.get('uds:service_token');
const headers = { Authorization: serviceToken };

// Periodically update consumer offset to commit processed messages
function commitMessages() {
  if (commits.length > 0) {
    logger.info('Committing successfully handled events: ', commits);

    offset.commit(groupId, commits, (err, data) => {
      if (err) {
        logger.error('Error committing offsets: ', err);
        return;
      }

      logger.info('Commit of offsets was successful. Data = ', data);

      // Truncate the commits array.
      commits.length = 0;
    });
  }
  setTimeout(commitMessages, eventCommitInterval);
}


if (kafkaHost && kafkaTopic && groupId) {
  logger.info(`Kafka consumer init! Host: ${kafkaHost}, Topic: ${kafkaTopic}, Group: ${groupId}`);

  const autoCommit = false;
  const encoding = 'buffer';
  const keyEncoding = 'utf8';

  consumer = new kafka.ConsumerGroup({
    autoCommit,
    encoding,
    groupId,
    kafkaHost,
    keyEncoding,
  }, kafkaTopic);

  offset = new kafka.Offset(consumer.client);

  // Start periodic loop to commit handled events
  setTimeout(commitMessages, eventCommitInterval);

  consumer.on('offsetOutOfRange', err => {
    // TODO: Handle this properly, warn on missed events, ensure offset is updated
    logger.warn('Warning! Offset out-of-range. Need to adjust client offset.', err);
  });

  consumer.on('message', message => {
    logger.info('Kafka consumer: Received a message!');
    const decodedMessage = cbSchema.fromBuffer(message.value);
    logger.info('Kafka consumer: Decoded value: ', decodedMessage);

    // Convert Kafka event into UDS payload for API request
    const udsPayload = {
      key: decodedMessage.key,
      owner: decodedMessage.user,
      requestor: decodedMessage.user,
    };
    if (decodedMessage.data) {
      udsPayload.data = decodedMessage.data;
    }

    // Call the correct UDS endpoint with event paylaod
    const uri = `${udsHost}/api/v1/data.cb.${decodedMessage.operation}`;

    request.post({
      headers,
      json: udsPayload,
      uri,
    }).then(body => {
      if (body.ok) {
        // Push the offset into the commits array which periodically is commited
        logger.info(`UDS call succeeded! Adding event to pending commit list: ${udsPayload}`);
        commits.push({
          offset: message.offset + 1,
          partition: message.partition,
          topic: kafkaTopic,
        });
      } else {
        // TODO: Confirm Kafka will re-send the message after some visibility timeout
        logger.error('UDS call returned an error result!', body);
      }
    }).catch(err => {
      // TODO: Confirm Kafka will re-send the message after some visibility timeout
      logger.error('UDS called failed!', err);
    });
  });
} else {
  logger.info('Kafka consumer skipping initialization...');
}
/* eslint-enable promise/prefer-await-to-callbacks */
/* eslint-enable promise/prefer-await-to-then */
