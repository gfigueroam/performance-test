import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import setHandler from '../../../../../../app/api/v1/data.cb/set';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const data = 'Sample data value';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.cb.set', () => {
  after(() => {
    calculatedBehavior.set.restore();
  });

  it('returns no value', done => {
    sinon.stub(calculatedBehavior, 'set').callsFake((params) => {
      expect(params).to.deep.equal({
        data,
        key,
        user,
      });
    });
    setHandler.apply(swatchCtx, [key, data, user]).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.set.called).to.equal(true);
      done();
    }).catch(done);
  });
});
