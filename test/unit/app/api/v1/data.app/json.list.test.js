import chai from 'chai';

import listHandler from '../../../../../../app/api/v1/data.app/json.list';

const expect = chai.expect;

const app = 'test.data.app.json.list.app';
const password = 'testpassword1234';
const user = 'hmh-test-user.123';

describe('data.app.json.list', () => {
  it('returns an empty stub value', done => {
    listHandler(app, password, user).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
