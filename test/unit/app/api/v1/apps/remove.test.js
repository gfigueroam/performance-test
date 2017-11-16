import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import removeHandler from '../../../../../../app/api/v1/apps/remove';

const expect = chai.expect;

const name = 'test.apps.remove.name';

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
    removeHandler(name).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.remove.called).to.equal(true);
      done();
    }).catch(done);
  });
});
