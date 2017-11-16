import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import passwordsRemoveHandler from '../../../../../../app/api/v1/apps/passwords.remove';

const expect = chai.expect;

const name = 'test.apps.password.remove.name';
const passwordId = 'somepasswordId';

describe('apps.passwords.remove', () => {
  sinon.stub(apps, 'removePassword').callsFake((params) => {
    expect(params).to.deep.equal({
      name,
      passwordId,
    });

    return Promise.resolve();
  });

  it('returns no value', done => {
    passwordsRemoveHandler(name, passwordId).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
