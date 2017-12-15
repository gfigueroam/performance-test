import chai from 'chai';
import sinon from 'sinon';

import userData from '../../../../../../app/db/userData';
import logger from '../../../../../../app/monitoring/logger';
import setHandler from '../../../../../../app/api/v1/data.user/set';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const type = 'test';
const data = 'Sample custom user text';
const user = 'hmh-test-user.123';

const swatchCtx = { logger };


describe('data.user.set', () => {
  after(() => {
    userData.set.restore();
  });

  it('returns no value', done => {
    sinon.stub(userData, 'set').callsFake((params) => {
      expect(params).to.deep.equal({
        data,
        key,
        type,
        user,
      });
    });
    setHandler.apply(swatchCtx, [key, type, data, user]).then(result => {
      expect(result).to.equal(undefined);
      expect(userData.set.called).to.equal(true);
      done();
    }).catch(done);
  });
});
