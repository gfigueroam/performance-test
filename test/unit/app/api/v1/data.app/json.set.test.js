import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.app/json.set';

const expect = chai.expect;

const key = 'test.data.app.json.set.key';
const data = { additionalKey: true };
const app = 'test.data.app.json.set.app';
const user = 'hmh-test-user.123';

describe('data.app.json.set', () => {
  it('returns no value', done => {
    setHandler(key, data, app, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
