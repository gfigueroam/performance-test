import chai from 'chai';

import infoHandler from '../../../../../../app/api/v1/authz/info';

const expect = chai.expect;

const name = 'test.authz.info.name';

describe('authz.info', () => {
  it('returns an empty stub value', done => {
    infoHandler(name).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
