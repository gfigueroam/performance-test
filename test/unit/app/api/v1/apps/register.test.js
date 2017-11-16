import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import registerHandler from '../../../../../../app/api/v1/apps/register';

const expect = chai.expect;

const name = 'test.apps.register.name';
const password = 'testpassword1234';
const quota = 1024;

describe('apps.register', () => {
  after(() => {
    apps.register.restore();
  });

  it('returns no value', done => {
    sinon.stub(apps, 'register').callsFake((params) => {
      expect(params).to.deep.equal({
        name,
        password,
        quota,
      });
    });
    registerHandler(name, password, quota).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.register.called).to.equal(true);
      done();
    }).catch(done);
  });
});
