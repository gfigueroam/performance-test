import chai from 'chai';

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
});
