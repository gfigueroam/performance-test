import chai from 'chai';
import sinon from 'sinon';

import kafka from 'kafka-node';
import request from 'request-promise';

import runner from '../../../../app/kafka/runner';
import schemas from '../../../../app/kafka/schemas';

const expect = chai.expect;

const offsetStub = sinon.createStubInstance(kafka.Offset);
const consumerStub = sinon.createStubInstance(kafka.ConsumerGroup);


describe('runner', () => {
  const mockConfig = {
    initConsumer: () => (consumerStub),
    initOffset: () => (offsetStub),

    kafkaGroupId: 'test-group-id',
    kafkaTopic: 'test-kafka-topic',
    udsBaseUrl: 'http://localhost:5200/api/v1/data.cb',
    udsHeaders: { Authorization: 'test-header' },
  };

  const mockDecodedMessage = {
    data: '["v1", "v2"]',
    key: 'cb_unique_key',
    operation: 'set',
    user: 'cb_user_guid',
  };
  const mockMessage = {
    offset: 10,
    partition: 'mock-partition',
    value: schemas.cb.toBuffer(mockDecodedMessage),
  };

  before(() => {
    sinon.stub(request, 'post');
  });

  after(() => {
    request.post.restore();
  });

  it('should initialize kafka client and handle calls to UDS', () => {
    // Test calls three mock messages with different UDS responses
    //  First UDS call errors, next call fails, third call succeeds
    request.post.onFirstCall().callsFake(() => (Promise.reject('uds_call_failed')));
    request.post.onSecondCall().callsFake(() => (Promise.resolve({ ok: false })));
    request.post.onThirdCall().callsFake(params => {
      expect(params).to.have.all.keys('headers', 'json', 'uri');
      expect(params.headers).to.deep.equal(mockConfig.udsHeaders);
      expect(params.uri).to.equal('http://localhost:5200/api/v1/data.cb.set');
      expect(params.json).to.deep.equal({
        data: mockDecodedMessage.data,
        key: mockDecodedMessage.key,
        owner: mockDecodedMessage.user,
        requestor: mockDecodedMessage.user,
      });
      return Promise.resolve({ ok: true });
    });

    // Stub the offset commit call
    offsetStub.commit.callsFake((groupId, commits, fn) => {
      expect(groupId).to.equal(mockConfig.kafkaGroupId);
      expect(commits.length).to.equal(1);
      expect(commits[0]).to.deep.equal({
        offset: 11,
        partition: 'mock-partition',
        topic: 'test-kafka-topic',
      });

      // Call the callback function once for success and once for failure
      fn('offset_commit_error');
      fn(undefined, { commit: '11' });
    });

    // Stub the first call and execute callback log function
    consumerStub.on.onFirstCall().callsFake((evt, fn) => {
      expect(evt).to.equal('offsetOutOfRange');
      fn('mock-error-message');
    });
    // Stub the second call and execute the on-message function to cover all cases
    consumerStub.on.onSecondCall().callsFake((evt, fn) => {
      expect(evt).to.equal('message');
      fn(mockMessage);
      fn(mockMessage);
      fn(mockMessage);
    });

    runner.start(mockConfig);

    expect(request.post.called).to.equal(true);
  });
});
