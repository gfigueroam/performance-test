import chai from 'chai';

import registerHandler from '../../../../../../app/api/v1/authz/register';

const expect = chai.expect;

const name = 'test.authz.register.name';
const url = 'https://hmheng-uds.test.app/callback';

describe('authz.register', () => {
  it('returns no value', done => {
    registerHandler(name, url).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
