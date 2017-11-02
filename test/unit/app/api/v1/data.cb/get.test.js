import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';

import getHandler from '../../../../../../app/api/v1/data.cb/get';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const user = 'hmh-test-user.123';
let getStub;
describe('data.cb.get', () => {
  before(() => {
    getStub = sinon.stub(calculatedBehavior, 'get');
  });

  after(() => {
    calculatedBehavior.get.restore();
  });

  it('returns an object value', done => {
    const val = {
      key1: true,
      key2: 4,
      key3: 'string value',
      key4: [1, 2, 3],
      key5: {
        anotherKey: 5,
      },
    };
    getStub.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        user,
      });

      return Promise.resolve({
        Item: {
          data: val,
          key,
          user,
        },
      });
    });
    getHandler(key, user).then(result => {
      expect(result).to.deep.equal(val);
      expect(calculatedBehavior.get.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns undefined if there is no DynamoDB item', done => {
    getStub.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        user,
      });

      return Promise.resolve({});
    });
    getHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.get.called).to.equal(true);

      done();
    }).catch(done);
  });
});
