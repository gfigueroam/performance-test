import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import mergeHandler from '../../../../../../app/api/v1/data.app/json.merge';

const expect = chai.expect;

const key = 'test.data.app.json.merge.key';
const data = { additionalKey: true };
const app = 'test.data.app.json.merge.app';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.json.merge', () => {
  after(() => {
    appData.mergeJson.restore();
  });

  it('returns the new data value and the key', done => {
    sinon.stub(appData, 'mergeJson').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        data,
        key,
        user,
      });
      return Promise.resolve(data);
    });

    mergeHandler.apply(swatchCtx, [key, data, app, user]).then(result => {
      expect(result).to.deep.equal({
        data,
        key,
      });
      done();
    }).catch(done);
  });
});
