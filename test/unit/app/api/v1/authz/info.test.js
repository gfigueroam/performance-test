import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../../../app/db/authz';
import infoHandler from '../../../../../../app/api/v1/authz/info';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const mockAuthzResult = {
  name: 'testAuthzName',
  url: 'http://localhost:5201/authz',
};

const swatchCtx = { logger };
const name = 'test.authz.info.name';
let infoStub;

describe('authz.info', () => {
  before(() => {
    infoStub = sinon.stub(authz, 'info');
  });

  after(() => {
    authz.info.restore();
  });

  it('returns no value when there is no matching authz configuration', done => {
    infoStub.callsFake((params) => {
      expect(params).to.deep.equal({ name });

      return Promise.resolve(undefined);
    });
    infoHandler.apply(swatchCtx, [name]).then(result => {
      expect(result).to.equal(undefined);
      expect(authz.info.called).to.equal(true);
      done();
    }).catch(done);
  });

  it('returns authz information when there is a matching authz configuration', done => {
    infoStub.callsFake((params) => {
      expect(params).to.deep.equal({ name });
      return Promise.resolve(mockAuthzResult);
    });
    infoHandler.apply(swatchCtx, [name]).then(result => {
      expect(result).to.equal(mockAuthzResult);
      expect(authz.info.called).to.equal(true);
      done();
    }).catch(done);
  });
});
