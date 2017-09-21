import chai from 'chai';

import usersHandler from '../../../../../../app/api/v1/data.admin/users';

const expect = chai.expect;

const realm = 'json';

describe('data.admin.users', () => {
  it('returns an empty stub array', done => {
    usersHandler(realm).then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
