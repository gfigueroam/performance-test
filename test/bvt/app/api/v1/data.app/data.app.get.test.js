import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const app = `uds.bvt.data.app.get.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.get.test.${seed.buildNumber}`;
const requestor = 'data.requestor.test.requestor.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

describe('data.app.get', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });

    await seed.app.add({
      app,
      data,
      key,
      user: requestor,
    });
  });

  after(async () => {
    await seed.apps.removeApps([app]);

    await seed.app.remove({
      app,
      key,
      user: requestor,
    });
  });

  it('throws invalid_app when the app contains invalid characters', (done) => {
    http.sendPostRequest(paths.DATA_APP_GET, tokens.serviceToken, {
      app: 'invalid-app-name',
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_INVALID_APP,
        ok: false,
      });
      done();
    });
  });

  it('throws app_not_found when the app has not been registered in the system', (done) => {
    http.sendPostRequest(paths.DATA_APP_GET, tokens.serviceToken, {
      app: 'non.existent.app',
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_APP_NOT_FOUND,
        ok: false,
      });
      done();
    });
  });

  it('returns null when retrieving a non-existent key', (done) => {
    http.sendPostRequest(paths.DATA_APP_GET, tokens.serviceToken, {
      app,
      key: 'non.existent.key',
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
      });
      done();
    });
  });

  it('returns stored data when retrieving a previously set key', (done) => {
    http.sendPostRequest(paths.DATA_APP_GET, tokens.serviceToken, {
      app,
      key,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data,
          key,
        },
      });
      done();
    });
  });
});
