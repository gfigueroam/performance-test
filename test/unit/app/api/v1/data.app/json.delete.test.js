import chai from 'chai';

import deleteHandler from '../../../../../../app/api/v1/data.app/json.delete';

const expect = chai.expect;

const key = 'test.data.app.json.delete.key';
const app = 'test.data.app.json.delete.app';
const password = 'testpassword1234';
const user = 'hmh-test-user.123';

describe('data.app.json.delete', () => {
  it('returns no value', done => {
    deleteHandler(key, app, password, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
