import avro from 'avsc';
import kafka from 'kafka-node';

import config from '../../app/config';
import schemas from '../../app/kafka/schemas';

const type = avro.Type.forSchema(schemas.cb);

const kafkaHost = config.get('kafka:host');
const kafkaTopic = config.get('kafka:topic');

// eslint-disable-next-line no-console
console.log(`Kafka producer init! Host: ${kafkaHost}, Topic: ${kafkaTopic}`);

const client = new kafka.KafkaClient({
  autoConnect: true,
  kafkaHost,
});

const producer = new kafka.HighLevelProducer(client);

// Sample calculated behavior data for a dev user
const testData = {
  data: '["val3", "val4"]',
  key: 'uds_bt_dev_test_key',
  operation: 'set',
  user: '3df3bf12-e3a1-4c3c-8083-923c2a7cb36e',
};
const testMessages = [type.toBuffer(testData)];
const testPayload = [{
  messages: testMessages,
  topic: kafkaTopic,
}];

producer.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log('Kafka producer is ready. Sending message.....');

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  producer.send(testPayload, (err, data) => {
    // eslint-disable-next-line no-console
    console.log('Kafka producer finished sending message');

    if (err) {
      // eslint-disable-next-line no-console
      console.error('Kafka producer error: ', err);
    }
    // eslint-disable-next-line no-console
    console.log('Kafka producer result: ', data);

    // Gracefully close the client and exit.
    client.close(() => {
      process.exit(0);
    });
  });
});
