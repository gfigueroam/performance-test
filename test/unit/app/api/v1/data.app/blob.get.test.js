import chai from 'chai';

import getHandler from '../../../../../../app/api/v1/data.app/blob.get';

const expect = chai.expect;

const app = 'test.data.app.blob.get.app';
const password = 'testpassword1234';
const user = 'hmh-test-user.123';

describe('data.app.blob.get', () => {
  it('returns an empty stub value', done => {
    getHandler(app, password, user).then(result => {
      expect(result).to.equal('');
      done();
    }).catch(done);
  });
});
