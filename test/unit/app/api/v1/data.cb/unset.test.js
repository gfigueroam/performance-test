import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import unsetHandler from '../../../../../../app/api/v1/data.cb/unset';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.unset', () => {
  before(() => {
    sinon.stub(calculatedBehavior, 'unset');
  });

  after(() => {
    calculatedBehavior.unset.restore();
  });

  it('returns no value', done => {
    calculatedBehavior.unset.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });
    });
    unsetHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.unset.called).to.equal(true);
      done();
    }).catch(done);
  });
});
