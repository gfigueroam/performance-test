import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import removeHandler from '../../../../../../app/api/v1/apps/remove';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const name = 'test.apps.remove.name';
const swatchCtx = { logger };

describe('apps.remove', () => {
  after(() => {
    apps.remove.restore();
  });

  it('returns no value', done => {
    sinon.stub(apps, 'remove').callsFake((params) => {
      expect(params).to.deep.equal({
        name,
      });
    });
    removeHandler.apply(swatchCtx, [name]).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.remove.called).to.equal(true);
      done();
    }).catch(done);
  });
});
