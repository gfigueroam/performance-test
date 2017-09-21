import chai from 'chai';

import removeHandler from '../../../../../../app/api/v1/apps/remove';

const expect = chai.expect;

const name = 'test.apps.remove.name';

describe('apps.remove', () => {
  it('returns no value', done => {
    removeHandler(name).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
