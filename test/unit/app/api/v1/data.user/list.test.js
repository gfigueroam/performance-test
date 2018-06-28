import chai from 'chai';
import sinon from 'sinon';

import userData from '../../../../../../app/db/userData';
import logger from '../../../../../../app/monitoring/logger';
import listHandler from '../../../../../../app/api/v1/data.user/list';

const expect = chai.expect;

const key = 'test.data.user.list.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.user.list', () => {
  before(() => {
    sinon.stub(userData, 'list');
  });

  after(() => {
    userData.list.restore();
  });

  it('handles an empty array', done => {
    userData.list.callsFake((params) => {
      expect(params).to.deep.equal({
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        keys: [],
      });
    });

    listHandler.apply(swatchCtx, [requestor]).then(result => {
      expect(result).to.deep.equal({
        keys: [],
      });
      done();
    }).catch(done);
  });

  it('handles an array with an item', done => {
    userData.list.callsFake((params) => {
      expect(params).to.deep.equal({
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        keys: [key],
      });
    });

    listHandler.apply(swatchCtx, [requestor]).then(result => {
      expect(result).to.deep.equal({
        keys: [key],
      });
      done();
    }).catch(done);
  });
});
