import chai from 'chai';

import getSharedHandler from '../../../../../../app/api/v1/data.user/getShared';

const expect = chai.expect;

const id = 'bvtshare1234id';

describe('data.user.getShared', () => {
  it('returns an empty stub value', done => {
    getSharedHandler(id).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
