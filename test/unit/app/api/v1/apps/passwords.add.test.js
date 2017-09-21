import chai from 'chai';

import passwordsAddHandler from '../../../../../../app/api/v1/apps/passwords.add';

const expect = chai.expect;

const name = 'test.apps.password.add.name';
const password = 'testpassword1234';

describe('apps.passwords.add', () => {
  it('returns an empty stub value', done => {
    passwordsAddHandler(name, password).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
