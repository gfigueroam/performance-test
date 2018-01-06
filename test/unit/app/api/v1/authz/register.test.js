import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../../../app/db/authz';
import registerHandler from '../../../../../../app/api/v1/authz/register';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const name = 'test.authz.register.name';
const url = 'https://hmheng-uds.test.app/callback';
const swatchCtx = { logger };


describe('authz.register', () => {
  after(() => {
    authz.register.restore();
  });

  it('returns no value', done => {
    sinon.stub(authz, 'register').callsFake((params) => {
      expect(params).to.deep.equal({ name, url });
    });
    registerHandler.apply(swatchCtx, [name, url]).then(result => {
      expect(result).to.equal(undefined);
      expect(authz.register.called).to.equal(true);
      done();
    }).catch(done);
  });
});
