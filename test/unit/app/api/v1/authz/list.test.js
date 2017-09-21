import chai from 'chai';

import listHandler from '../../../../../../app/api/v1/authz/list';

const expect = chai.expect;

describe('authz.list', () => {
  it('returns an empty array', done => {
    listHandler().then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
