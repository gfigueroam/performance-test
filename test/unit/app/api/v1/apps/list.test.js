import chai from 'chai';

import listHandler from '../../../../../../app/api/v1/apps/list';

const expect = chai.expect;

describe('apps.list', () => {
  it('returns an empty array', done => {
    listHandler().then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
