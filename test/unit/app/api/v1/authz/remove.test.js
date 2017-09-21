import chai from 'chai';

import removeHandler from '../../../../../../app/api/v1/authz/remove';

const expect = chai.expect;

const name = 'test.authz.remove.name';

describe('authz.remove', () => {
  it('returns no value', done => {
    removeHandler(name).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
