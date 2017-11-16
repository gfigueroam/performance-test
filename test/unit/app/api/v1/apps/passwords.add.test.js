import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import passwordsAddHandler from '../../../../../../app/api/v1/apps/passwords.add';

const expect = chai.expect;

const name = 'test.apps.password.add.name';
const password = 'testpassword1234';
const passwordId = 'somepasswordId';

describe('apps.passwords.add', () => {
  sinon.stub(apps, 'addPassword').callsFake((params) => {
    expect(params).to.deep.equal({
      name,
      password,
    });

    return Promise.resolve(passwordId);
  });

  it('returns an empty stub value', done => {
    passwordsAddHandler(name, password).then(result => {
      expect(result).to.deep.equal({
        id: passwordId,
      });
      done();
    }).catch(done);
  });
});
