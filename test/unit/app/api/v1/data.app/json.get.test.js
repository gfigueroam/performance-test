import chai from 'chai';

import getHandler from '../../../../../../app/api/v1/data.app/json.get';

const expect = chai.expect;

const key = 'test.data.app.json.get.key';
const app = 'test.data.app.json.get.app';
const user = 'hmh-test-user.123';

describe('data.app.json.get', () => {
  it('returns an empty stub value', done => {
    getHandler(key, app, user).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
