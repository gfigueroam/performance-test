import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const app = `uds.bvt.data.app.list.app.${seed.buildNumber}`;
const key1 = `uds.bvt.data.app.list.test.1.${seed.buildNumber}`;
const key2 = `uds.bvt.data.app.list.test.2.${seed.buildNumber}`;
const requestor = `data.app.test.requestor.${seed.buildNumber}`;
const data = {};

describe('data.app.list', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });
  });
  after(async () => {
    await seed.app.remove({
      app,
      key: key1,
      user: requestor,
    });

    await seed.app.remove({
      app,
      key: key2,
      user: requestor,
    });

    await seed.apps.removeApps([app]);
  });

  it('returns app_not_found when the app is not registered', (done) => {
    http.sendPostRequest(paths.DATA_APP_LIST, tokens.serviceToken, {
      app: 'non.existent.app',
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

  it('returns an empty list when no keys are set', (done) => {
    http.sendPostRequest(paths.DATA_APP_LIST, tokens.serviceToken, {
      app,
      requestor,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          keys: [],
        },
      });
      done();
    });
  });

  it('returns a list of one key', async () => {
    await seed.app.add({
      app,
      data,
      key: key1,
      user: requestor,
    });
    return new Promise((resolve) => {
      http.sendPostRequest(paths.DATA_APP_LIST, tokens.serviceToken, {
        app,
        requestor,
      }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: {
            keys: [key1],
          },
        });
        resolve();
      });
    });
  });

  it('returns a list of two keys', async () => {
    await seed.app.add({
      app,
      data,
      key: key2,
      user: requestor,
    });
    return new Promise((resolve) => {
      http.sendPostRequest(paths.DATA_APP_LIST, tokens.serviceToken, {
        app,
        requestor,
      }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: {
            keys: [key1, key2],
          },
        });
        resolve();
      });
    });
  });
});
