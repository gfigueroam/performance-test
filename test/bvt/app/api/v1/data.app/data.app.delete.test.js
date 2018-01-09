import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const app = `uds.bvt.data.app.delete.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.delete.test.${seed.buildNumber}`;
const user = 'data.user.test.user.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

describe('data.app.delete', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });

    await seed.app.add({
      app,
      data,
      key,
      user,
    });
  });

  after(async () => {
    await seed.apps.removeApps([app]);
  });

  it('throws invalid_app when the app contains invalid characters', (done) => {
    http.sendPostRequest(paths.DATA_APP_DELETE, tokens.serviceToken, {
      app: 'invalid-app-name',
      key,
      user,
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
    http.sendPostRequest(paths.DATA_APP_DELETE, tokens.serviceToken, {
      app: 'non.existent.app',
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_APP_NOT_FOUND,
        ok: false,
      });
      done();
    });
  });

  it('throws key_not_found when no data was previously stored at the key', (done) => {
    http.sendPostRequest(paths.DATA_APP_DELETE, tokens.serviceToken, {
      app,
      key: 'non.existent.key',
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_KEY_NOT_FOUND,
        ok: false,
      });
      done();
    });
  });

  it('successfully deletes stored data', (done) => {
    http.sendPostRequest(paths.DATA_APP_DELETE, tokens.serviceToken, {
      app,
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
      });

      http.sendPostRequest(paths.DATA_APP_GET, tokens.serviceToken, {
        app,
        key,
        user,
      }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
        });
        done();
      });
    });
  });
});
