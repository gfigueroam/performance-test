import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import incrementHandler from '../../../../../../app/api/v1/data.cb/increment';

const expect = chai.expect;

const key = 'test.data.user.increment.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.increment', () => {
  before(() => {
    sinon.stub(calculatedBehavior, 'atomicUpdate');
  });

  after(() => {
    calculatedBehavior.atomicUpdate.restore();
  });

  it('calls calculatedBehavior.atomicUpdate', done => {
    calculatedBehavior.atomicUpdate.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
        value: 1,
      });

      return Promise.resolve({
        Item: {
          key,
          user: requestor,
        },
      });
    });

    incrementHandler.apply(swatchCtx, [key, requestor]).then(() => {
      expect(calculatedBehavior.atomicUpdate.called).to.equal(true);

      done();
    }).catch(done);
  });
});
