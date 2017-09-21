import chai from 'chai';

import deleteHandler from '../../../../../../app/api/v1/data.user/delete';

const expect = chai.expect;

const key = 'test.data.user.delete.name';
const user = 'hmh-test-user.123';

describe('data.user.delete', () => {
  it('returns no value', done => {
    deleteHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
