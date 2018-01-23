import chai from 'chai';
import sinon from 'sinon';

import userData from '../../../../../../app/db/userData';
import logger from '../../../../../../app/monitoring/logger';
import deleteHandler from '../../../../../../app/api/v1/data.user/delete';

const expect = chai.expect;

const key = 'test.data.user.delete.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.user.delete', () => {
  after(() => {
    userData.unset.restore();
  });

  it('returns no value', done => {
    sinon.stub(userData, 'unset').callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });
    });
    deleteHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
