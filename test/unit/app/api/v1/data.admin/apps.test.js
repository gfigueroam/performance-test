import chai from 'chai';

import appsHandler from '../../../../../../app/api/v1/data.admin/apps';

const expect = chai.expect;

const realm = 'json';
const user = 'hmh-test-user.123';

describe('data.admin.apps', () => {
  it('returns an empty stub array', done => {
    appsHandler(realm, user).then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
