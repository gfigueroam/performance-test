import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import infoHandler from '../../../../../../app/api/v1/apps/info';

const expect = chai.expect;
const APP = {
  name: 'someAppName',
  quota: 324234,
};

const name = 'test.apps.info.name';
let infoStub;

describe('apps.info', () => {
  before(() => {
    infoStub = sinon.stub(apps, 'info');
  });

  after(() => {
    apps.info.restore();
  });

  it('returns no value when there is no matching app', done => {
    infoStub.callsFake((params) => {
      expect(params).to.deep.equal({
        name,
      });

      return Promise.resolve(undefined);
    });
    infoHandler(name).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.info.called).to.equal(true);
      done();
    }).catch(done);
  });

  it('returns app information when there is a matching app', done => {
    infoStub.callsFake((params) => {
      expect(params).to.deep.equal({
        name,
      });

      return Promise.resolve(APP);
    });
    infoHandler(name).then(result => {
      expect(result).to.equal(APP);
      expect(apps.info.called).to.equal(true);
      done();
    }).catch(done);
  });
});
