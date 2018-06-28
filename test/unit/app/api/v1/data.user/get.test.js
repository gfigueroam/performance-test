import chai from 'chai';
import sinon from 'sinon';

import userData from '../../../../../../app/db/userData';
import logger from '../../../../../../app/monitoring/logger';
import getHandler from '../../../../../../app/api/v1/data.user/get';

const expect = chai.expect;

const key = 'test.data.user.get.name';
const requestor = 'hmh-test-user.123';
const data = 'some data';
const swatchCtx = { logger };


describe('data.user.get', () => {
  before(() => {
    sinon.stub(userData, 'get');
  });

  after(() => {
    userData.get.restore();
  });

  it('returns an empty value when no item is returned', done => {
    userData.get.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        Item: undefined,
      });
    });
    getHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.deep.equal(undefined);
      done();
    }).catch(done);
  });

  it('returns an the data value when an item is returned', done => {
    userData.get.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        Item: {
          createdBy: requestor,
          data,
          key,
          type: 'text',
          updatedBy: requestor,
        },
      });
    });
    getHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.deep.equal({
        createdBy: requestor,
        data,
        key,
        type: 'text',
        updatedBy: requestor,
      });
      done();
    }).catch(done);
  });
});
