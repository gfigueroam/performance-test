import chai from 'chai';

import schemas from '../../../../app/kafka/schemas';

const expect = chai.expect;

const key = 'cb_unique_key';
const user = 'cb_user_guid';
const operation = 'set';
const data = '["v1", "v2"]';

const event = { data, key, operation, user };


describe('schemas', () => {
  it('should define an event schema', () => {
    // Start by confirming properties on the initial event
    expect(event.key).to.equal(key);
    expect(event.user).to.equal(user);
    expect(event.operation).to.equal(operation);
    expect(event.data).to.equal(data);

    // Serializer and deserialize a sample event based on schema
    const buffer = schemas.calculatedBehavior.toBuffer(event);
    const finalEvent = schemas.calculatedBehavior.fromBuffer(buffer);

    // Verify the final event properties match the original
    expect(event.key).to.equal(finalEvent.key);
    expect(event.user).to.equal(finalEvent.user);
    expect(event.operation).to.equal(finalEvent.operation);
    expect(event.data).to.equal(finalEvent.data);
  });
});
