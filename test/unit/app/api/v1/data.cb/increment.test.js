import chai from 'chai';

import incrementHandler from '../../../../../../app/api/v1/data.cb/increment';

const expect = chai.expect;

const key = 'test.data.user.increment.name';
const user = 'hmh-test-user.123';

describe('data.cb.increment', () => {
  it('returns no value', done => {
    incrementHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
