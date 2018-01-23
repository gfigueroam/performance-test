import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import mergeHandler from '../../../../../../app/api/v1/data.app/merge';

const expect = chai.expect;

const key = 'test.data.app.merge.key';
const data = { additionalKey: true };
const app = 'test.data.app.merge.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.merge', () => {
  after(() => {
    appData.merge.restore();
  });

  it('returns the new data value and the key', done => {
    sinon.stub(appData, 'merge').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        data,
        key,
        owner: undefined,
        requestor,
      });
      return Promise.resolve(data);
    });

    mergeHandler.apply(swatchCtx, [key, data, app, requestor]).then(result => {
      expect(result).to.deep.equal({
        data,
        key,
      });
      done();
    }).catch(done);
  });
});
