import chai from 'chai';
import sinon from 'sinon';

import kafka from 'kafka-node';

import config from '../../../../app/kafka/config';

const expect = chai.expect;


describe('config', () => {
  it('should define a configuration for kafka constumer', () => {
    // Start by confirming properties on the initial event
    expect(config.kafkaGroupId).to.equal(undefined);
    expect(config.kafkaTopic).to.equal(undefined);
    expect(config.udsHeaders.Authorization).not.to.equal(undefined);
    expect(config.udsBaseUrl).to.equal('http://localhost:5200/api/v1/data.cb');
  });

  it('should initialize a consumer', () => {
    sinon.stub(kafka, 'ConsumerGroup').callsFake((c, t) => {
      // No kafka topic or group defined in test config
      expect(t).to.equal(undefined);
      expect(c).to.deep.equal({
        autoCommit: true,
        encoding: 'buffer',
        groupId: undefined,
        kafkaHost: 'kafka.brcore01.internal:9092',
        keyEncoding: 'utf8',
      });
      return { client: { mock: true } };
    });

    const consumer = config.initConsumer();
    expect(consumer).not.to.equal(undefined);

    kafka.ConsumerGroup.restore();
  });
});
