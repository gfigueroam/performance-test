import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import decrementHandler from '../../../../../../app/api/v1/data.cb/decrement';

const expect = chai.expect;

const key = 'test.data.user.decrement.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.decrement', () => {
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
        value: -1,
      });

      return Promise.resolve({});
    });

    decrementHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.atomicUpdate.called).to.equal(true);

      done();
    }).catch(done);
  });
});
