import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import registerHandler from '../../../../../../app/api/v1/apps/register';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const name = 'test.apps.register.name';
const quota = 1024;
const swatchCtx = { logger };

describe('apps.register', () => {
  after(() => {
    apps.register.restore();
  });

  it('returns no value', done => {
    sinon.stub(apps, 'register').callsFake((params) => {
      expect(params).to.deep.equal({
        name,
        quota,
      });
    });
    registerHandler.apply(swatchCtx, [name, quota]).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.register.called).to.equal(true);
      done();
    }).catch(done);
  });
});
