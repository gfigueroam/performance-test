import chai from 'chai';

import registerHandler from '../../../../../../app/api/v1/apps/register';

const expect = chai.expect;

const name = 'test.apps.register.name';
const password = 'testpassword1234';
const quota = 1024;

describe('apps.register', () => {
  it('returns no value', done => {
    registerHandler(name, password, quota).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
