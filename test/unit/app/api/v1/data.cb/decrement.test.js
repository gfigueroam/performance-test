import chai from 'chai';

import decrementHandler from '../../../../../../app/api/v1/data.cb/decrement';

const expect = chai.expect;

const key = 'test.data.user.decrement.name';
const user = 'hmh-test-user.123';

describe('data.cb.decrement', () => {
  it('returns no value', done => {
    decrementHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
