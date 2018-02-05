import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import listHandler from '../../../../../../app/api/v1/data.app/list';

const expect = chai.expect;

const app = 'test.data.app.list.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.list', () => {
  after(() => {
    appData.list.restore();
  });
  it('returns an empty stub value', done => {
    sinon.stub(appData, 'list').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        owner: undefined,
        requestor,
      });
      return Promise.resolve({
        keys: ['data_1', 'data_2'],
      });
    });
    listHandler.apply(swatchCtx, [app, requestor]).then(result => {
      expect(result).to.deep.equal({
        keys: ['data_1', 'data_2'],
      });
      done();
    }).catch(done);
  });
});
