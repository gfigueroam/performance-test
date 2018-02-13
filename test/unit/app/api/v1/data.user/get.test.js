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

let getStub;

describe('data.user.get', () => {
  before(() => {
    getStub = sinon.stub(userData, 'get');
  });

  after(() => {
    userData.get.restore();
  });

  it('returns an empty value when no item is returned', done => {
    getStub.callsFake((params) => {
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
    getStub.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        Item: {
          data,
          key,
          type: 'text',
        },
      });
    });
    getHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.deep.equal({
        data,
        key,
        type: 'text',
      });
      done();
    }).catch(done);
  });
});
