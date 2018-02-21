import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const app1 = `uds.bvt.data.admin.apps.app.${seed.buildNumber}.1`;
const app2 = `uds.bvt.data.admin.apps.app.${seed.buildNumber}.2`;
const key1 = `uds.bvt.data.admin.apps.key.${seed.buildNumber}.1`;
const key2 = `uds.bvt.data.admin.apps.key.${seed.buildNumber}.2`;
const user = `uds.bvt.data.admin.apps.user.${seed.buildNumber}`;
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

const path = paths.DATA_ADMIN_APPS;

describe('data.admin.apps', () => {
  before(async () => {
    // Register the apps
    await seed.apps.addApp({ name: app1, quota: 1024 });
    await seed.apps.addApp({ name: app2, quota: 1024 });
  });

  after(async () => {
    // Delete the app and user data
    await seed.app.remove({ app: app1, key: key1, user });
    await seed.app.remove({ app: app1, key: key2, user });
    await seed.app.remove({ app: app2, key: key1, user });

    // Delete the apps themselves
    await seed.apps.removeApps([app1, app2]);
  });

  it('should return error when the request has a user token', done => {
    const params = { user };
    const userToken = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('returns an empty array when the user has no app data', (done) => {
    http.sendPostRequest(path, tokens.serviceToken, {
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: [],
      });
      done();
    });
  });

  it('returns an empty array when the user has only has user data', (done) => {
    seed.user.set({
      data: 'some text data',
      key: key1,
      type: 'text',
      user,
    }, () => {
      http.sendPostRequest(path, tokens.serviceToken, { user }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [],
        });
        seed.user.unset({ key: key1, user }, done);
      });
    });
  });

  it('returns a single app when the user has only one app with data', (done) => {
    // Store some app data.
    seed.app.add({
      app: app1,
      data,
      key: key1,
      user,
    }).then(() => {
      http.sendPostRequest(path, tokens.serviceToken, { user }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [app1],
        });
        done();
      });
    }).catch(done);
  });

  it('returns a single app even if the user has multiple keys stored under the app', (done) => {
    // Store some app data.
    seed.app.add({
      app: app1,
      data,
      key: key2,
      user,
    }).then(() => {
      http.sendPostRequest(path, tokens.serviceToken, {
        user,
      }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [app1],
        });
        done();
      });
    }).catch(done);
  });

  it('returns multiple apps when the user has data in each', async () => {
    await seed.app.add({
      app: app2,
      data,
      key: key1,
      user,
    });
    await new Promise((resolve, reject) => {
      http.sendPostRequest(path, tokens.serviceToken, {
        user,
      }, (err, response) => {
        if (err) {
          return reject(err);
        }
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [app1, app2],
        });
        return resolve();
      });
    });
  });
});
