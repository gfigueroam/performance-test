import chai from 'chai';

import listHandler from '../../../../../../app/api/v1/data.user/list';

const expect = chai.expect;

const user = 'hmh-test-user.123';

describe('data.user.list', () => {
  it('returns an empty array', done => {
    listHandler(user).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
