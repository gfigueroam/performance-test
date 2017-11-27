import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import listHandler from '../../../../../../app/api/v1/apps/list';

const expect = chai.expect;
const EXISTING_APPS = [{
  name: 'testApp1',
  quota: 1024,
}, {
  name: 'testApp2',
  quota: 2048,
}];

let listStub;

describe('apps.list', () => {
  before(() => {
    listStub = sinon.stub(apps, 'list');
  });

  after(() => {
    apps.list.restore();
  });

  it('returns empty set when there are no apps in the database', done => {
    listStub.callsFake(() => (Promise.resolve([])));
    listHandler().then(result => {
      expect(result).to.deep.equal([]);
      expect(apps.list.called).to.equal(true);
      done();
    }).catch(done);
  });

  it('returns app information when there are apps in the database', done => {
    listStub.callsFake(() => (Promise.resolve(EXISTING_APPS)));
    listHandler().then(result => {
      expect(result).to.deep.equal(EXISTING_APPS);
      expect(apps.list.called).to.equal(true);
      done();
    }).catch(done);
  });
});
