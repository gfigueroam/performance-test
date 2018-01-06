import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../../../app/db/authz';
import removeHandler from '../../../../../../app/api/v1/authz/remove';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const name = 'test.authz.remove.name';
const swatchCtx = { logger };

describe('authz.remove', () => {
  after(() => {
    authz.remove.restore();
  });

  it('returns no value', done => {
    sinon.stub(authz, 'remove').callsFake((params) => {
      expect(params).to.deep.equal({ name });
    });
    removeHandler.apply(swatchCtx, [name]).then(result => {
      expect(result).to.equal(undefined);
      expect(authz.remove.called).to.equal(true);
      done();
    }).catch(done);
  });
});
