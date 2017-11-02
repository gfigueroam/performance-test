import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';

import incrementHandler from '../../../../../../app/api/v1/data.cb/increment';

const expect = chai.expect;

const key = 'test.data.user.increment.name';
const user = 'hmh-test-user.123';

describe('data.cb.increment', () => {
  after(() => {
    calculatedBehavior.atomicUpdate.restore();
  });

  it('calls calculatedBehavior.atomicUpdate', done => {
    sinon.stub(calculatedBehavior, 'atomicUpdate').callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        user,
        value: 1,
      });

      return Promise.resolve({
        Item: {
          key,
          user,
        },
      });
    });

    incrementHandler(key, user).then(() => {
      expect(calculatedBehavior.atomicUpdate.called).to.equal(true);

      done();
    }).catch(done);
  });
});
