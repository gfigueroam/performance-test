import chai from 'chai';
import sinon from 'sinon';

import kafka from 'kafka-node';
import request from 'request-promise';

import runner from '../../../../app/kafka/runner';
import schemas from '../../../../app/kafka/schemas';

const expect = chai.expect;

let clock;
let requestStub;

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

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    requestStub = sinon.stub(request, 'post');

    // Always stub the first call and execute callback log function
    consumerStub.on.onFirstCall().callsFake((evt, fn) => {
      expect(evt).to.equal('offsetOutOfRange');
      fn('mock-error-message');
    });
  });

  afterEach(() => {
    clock.restore();
    requestStub.restore();
  });

  it('should initialize kafka client and handle calls to UDS', () => {
    // Test calls three mock messages with different UDS responses
    //  First UDS call errors, next call fails, third call succeeds
    requestStub.onFirstCall().callsFake(() => (Promise.reject('uds_call_failed')));
    requestStub.onSecondCall().callsFake(() => (Promise.resolve({ ok: false })));
    requestStub.onThirdCall().callsFake(params => {
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
        data: mockDecodedMessage.data,
        key: mockDecodedMessage.key,
        owner: mockDecodedMessage.user,
        requestor: mockDecodedMessage.user,
      });

      // Call the callback function once for success and once for failure
      fn('offset_commit_error');
      expect(commits.length).to.equal(1);

      // After successful commit, the commit queue should be cleared
      fn(undefined, { commit: '0' });
      expect(commits.length).to.equal(0);
    });
    consumerStub.on.onSecondCall().callsFake((evt, fn) => {
      expect(evt).to.equal('message');
      fn(mockMessage);
      fn(mockMessage);
      fn(mockMessage);

      // Move timer forward to run kafka commit code
      clock.tick(2500);
    });

    runner.start(mockConfig);
  });
});
