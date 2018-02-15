import chai from 'chai';
import sinon from 'sinon';

import authz from '../../../../../../app/db/authz';
import listHandler from '../../../../../../app/api/v1/authz/list';
import logger from '../../../../../../app/monitoring/logger';

const expect = chai.expect;

const mockAuthzResults = [{
  name: 'testAuthz1',
  url: 'http://localhost:5200/authz/one',
}, {
  name: 'testAuthz2',
  url: 'http://localhost:5200/authz/two',
}];
const swatchCtx = { logger };

let listStub;


describe('authz.list', () => {
  before(() => {
    listStub = sinon.stub(authz, 'list');
  });

  after(() => {
    authz.list.restore();
  });

  it('returns empty set when there are no authz configurations in the database', done => {
    listStub.callsFake(() => (Promise.resolve([])));
    listHandler.apply(swatchCtx).then(result => {
      expect(result).to.deep.equal([]);
      expect(authz.list.called).to.equal(true);
      done();
    }).catch(done);
  });

  it('returns authz information when there are authz configurations in the database', done => {
    listStub.callsFake(() => (Promise.resolve(mockAuthzResults)));
    listHandler.apply(swatchCtx).then(result => {
      expect(result).to.deep.equal(mockAuthzResults);
      expect(authz.list.called).to.equal(true);
      done();
    }).catch(done);
  });
});
