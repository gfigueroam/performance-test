import chai from 'chai';

import getHandler from '../../../../../../app/api/v1/data.hmh/contentProgression.get';

const expect = chai.expect;

describe('data.hmh.contentProgression.get', () => {
  it('returns no value', done => {
    getHandler().then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
