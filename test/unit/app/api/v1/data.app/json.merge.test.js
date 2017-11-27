import chai from 'chai';

import mergeHandler from '../../../../../../app/api/v1/data.app/json.merge';

const expect = chai.expect;

const key = 'test.data.app.json.merge.key';
const data = { additionalKey: true };
const app = 'test.data.app.json.merge.app';
const user = 'hmh-test-user.123';

describe('data.app.json.merge', () => {
  it('returns an empty stub value', done => {
    mergeHandler(key, data, app, user).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
