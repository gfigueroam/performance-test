import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.hmh/contentProgression.set';

const expect = chai.expect;

describe('data.hmh.contentProgression.set', () => {
  it('returns no value', done => {
    setHandler().then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
