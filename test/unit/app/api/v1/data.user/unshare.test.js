import chai from 'chai';

import unshareHandler from '../../../../../../app/api/v1/data.user/unshare';

const expect = chai.expect;

const id = 'test.data.user.unshare.id';
const user = 'hmh-test-user.123';

describe('data.user.unshare', () => {
  it('returns no value', done => {
    unshareHandler(id, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
