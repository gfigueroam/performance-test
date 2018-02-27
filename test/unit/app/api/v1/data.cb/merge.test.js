import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import mergeHandler from '../../../../../../app/api/v1/data.cb/merge';

const expect = chai.expect;

const key = 'test.data.user.merge.name';
const data = 'Sample data value';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.merge', () => {
  before(() => {
    sinon.stub(calculatedBehavior, 'merge');
  });

  after(() => {
    calculatedBehavior.merge.restore();
  });

  it('returns no value', done => {
    calculatedBehavior.merge.callsFake((params) => {
      expect(params).to.deep.equal({
        data,
        key,
        owner: undefined,
        requestor,
      });
    });
    mergeHandler.apply(swatchCtx, [key, data, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.merge.called).to.equal(true);
      done();
    }).catch(done);
  });
});
