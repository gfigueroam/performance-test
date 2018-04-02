import chai from 'chai';
import sinon from 'sinon';

import common from 'hmh-bfm-nodejs-common';

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

  // Start with a valid message object and encode based on avro schema
  const mockDecodedMessage = {
    data: '["v1", "v2"]',
    key: 'cb_unique_key',
    operation: 'set',
    user: 'cb_user_guid',
  };

  // Generate a valid data buffer and deserialize it correctly
  const validBuffer = schemas.cb.toBuffer(mockDecodedMessage);
  const validBufferLength = validBuffer.length;
  const mockMessage = {
    offset: 10,
    partition: 'mock-partition',
    value: validBuffer,
  };

  // Confluence serializer has a wire format starting with a '0x00' and
  //  then four bytes to denote the schema ID, which preprend the data
  // Generate an example confluent message and test that we deserialize correctly
  const prefixBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x3d]);
  const confluenceBufferLength = validBufferLength + prefixBuffer.length;
  const confluenceBuffer = Buffer.concat([prefixBuffer, validBuffer], confluenceBufferLength);
  const mockConfluenceMessage = {
    offset: 30,
    partition: 'mock-confluence',
    value: confluenceBuffer,
  };

  // Generate an example data payload with invalid contents and test that we reject
  const garbageBuffer = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const errorBufferLength = validBufferLength + garbageBuffer.length;
  const errorBuffer = Buffer.concat([garbageBuffer, validBuffer], errorBufferLength);
  const mockErrorMessage = {
    offset: 20,
    partition: 'mock-error',
    value: errorBuffer,
  };


  before(() => {
    sinon.stub(request, 'post');
  });

  after(() => {
    request.post.restore();
  });

  it('should initialize kafka client and handle calls to UDS', () => {
    // Test calls four mock messages with different UDS responses
    //  First UDS call errors, next call fails, third/fourth call succeed
    request.post.onCall(0).callsFake(() => (Promise.reject('uds_call_failed')));
    request.post.onCall(1).callsFake(() => (Promise.resolve({ ok: false })));
    request.post.onCall(2).callsFake(params => {
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
    request.post.onCall(3).callsFake(params => {
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

    // Stub the offset commit calls
    offsetStub.commit.onCall(0).callsFake((groupId, commits, fn) => {
      expect(groupId).to.equal(mockConfig.kafkaGroupId);
      expect(commits.length).to.equal(1);
      expect(commits[0]).to.deep.equal({
        offset: 11,
        partition: 'mock-partition',
        topic: 'test-kafka-topic',
      });

      // Call the callback function once for success
      fn(undefined, { commit: '11' });
    });
    offsetStub.commit.onCall(1).callsFake((groupId, commits, fn) => {
      expect(groupId).to.equal(mockConfig.kafkaGroupId);
      expect(commits.length).to.equal(1);
      expect(commits[0]).to.deep.equal({
        offset: 31,
        partition: 'mock-confluence',
        topic: 'test-kafka-topic',
      });

      // Call the callback function once for failure
      fn('offset_commit_error');
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
      fn(mockErrorMessage);
      fn(mockConfluenceMessage);
    });

    // Mute the actual test execution but check post-conditions
    common.test.mute.muteTest(() => {
      runner.start(mockConfig);
    });

    expect(request.post.callCount).to.equal(4);
    expect(consumerStub.on.callCount).to.equal(2);
  });
});
