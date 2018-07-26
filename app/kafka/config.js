import kafka from 'kafka-node';

import config from '../config';

// Environment-level configurations for Kafka consumer
const kafkaHost = config.get('kafka:host');
const kafkaTopic = config.get('kafka:topic');
const kafkaGroupId = config.get('kafka:group_id');

// Get the active server port from configuration
const serverPort = config.get('server_port');
const udsBaseUrl = `http://localhost:${serverPort}/api/v1/data.cb`;

// Use a fixed service token for internal UDS API requests
const serviceToken = config.get('uds:service_token');
const udsHeaders = { Authorization: serviceToken };

const autoCommit = false;
const encoding = 'buffer';
const keyEncoding = 'utf8';


function initConsumer() {
  return new kafka.ConsumerGroup({
    autoCommit,
    encoding,
    groupId: kafkaGroupId,
    kafkaHost,
    keyEncoding,
  }, kafkaTopic);
}

function initOffset(consumer) {
  return new kafka.Offset(consumer.client);
}

export default {
  initConsumer,
  initOffset,

  kafkaGroupId,
  kafkaTopic,
  udsBaseUrl,
  udsHeaders,
};
