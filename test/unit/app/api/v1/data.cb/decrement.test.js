import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';

import decrementHandler from '../../../../../../app/api/v1/data.cb/decrement';

const expect = chai.expect;

const key = 'test.data.user.decrement.name';
const user = 'hmh-test-user.123';

describe('data.cb.decrement', () => {
  after(() => {
    calculatedBehavior.atomicUpdate.restore();
  });

  it('calls calculatedBehavior.atomicUpdate', done => {
    sinon.stub(calculatedBehavior, 'atomicUpdate').callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        user,
        value: -1,
      });

      return Promise.resolve({
        Item: {
          key,
          user,
        },
      });
    });

    decrementHandler(key, user).then(() => {
      expect(calculatedBehavior.atomicUpdate.called).to.equal(true);

      done();
    }).catch(done);
  });
});
