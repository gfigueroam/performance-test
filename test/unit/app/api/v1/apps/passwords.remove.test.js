import chai from 'chai';

import passwordsRemoveHandler from '../../../../../../app/api/v1/apps/passwords.remove';

const expect = chai.expect;

const name = 'test.apps.password.remove.name';
const password = 'testpassword1234';

describe('apps.passwords.remove', () => {
  it('returns no value', done => {
    passwordsRemoveHandler(name, password).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
