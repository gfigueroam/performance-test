import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const app = `uds.bvt.data.admin.apps.app.${seed.buildNumber}.`;
const key = `uds.bvt.data.admin.apps.key.${seed.buildNumber}`;
const user = `uds.bvt.data.admin.apps.user.${seed.buildNumber}`;
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};
const numApps = 10;

describe('data.admin.apps', () => {
  before(async () => {
    // Register the apps
    for (let i = 0; i < numApps; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await seed.apps.addApp({
        name: `${app}${i}`,
        quota: 1024,
      });
    }
  });

  after(async () => {
    // Delete the apps
    const appsToRemove = [];
    for (let i = 0; i < numApps; i += 1) {
      appsToRemove.push(`${app}${i}`);
    }
    await seed.apps.removeApps(appsToRemove);
  });

  it('returns an empty array when the user has no app data', (done) => {
    http.sendPostRequest(paths.DATA_ADMIN_APPS, tokens.serviceToken, {
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
      data,
      key,
      type: 'text',
      user,

    }, () => {
      http.sendPostRequest(paths.DATA_ADMIN_APPS, tokens.serviceToken, {
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
  });

  it('returns a single app when the user has only one app with data', (done) => {
    // Store some app data.
    seed.app.add({
      app: `${app}0`,
      data,
      key,
      user,
    }).then(() => {
      http.sendPostRequest(paths.DATA_ADMIN_APPS, tokens.serviceToken, {
        user,
      }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [`${app}0`],
        });
        done();
      });
    }).catch(done);
  });

  it('returns a single app even if the user has multiple keys stored under the app', (done) => {
    // Store some app data.
    seed.app.add({
      app: `${app}0`,
      data,
      key: `${key}2`,
      user,
    }).then(() => {
      http.sendPostRequest(paths.DATA_ADMIN_APPS, tokens.serviceToken, {
        user,
      }, (err, response) => {
        expect(err).to.equal(null);
        expect(response.body).to.deep.equal({
          ok: true,
          result: [`${app}0`],
        });
        done();
      });
    }).catch(done);
  });

  it('returns multiple apps when the user has data in each', async () => {
    const expectedApps = [`${app}0`];
    for (let i = 1; i < numApps; i += 1) {
      expectedApps.push(`${app}${i}`);
      // eslint-disable-next-line no-await-in-loop
      await seed.app.add({
        app: `${app}${i}`,
        data,
        key: `${key}`,
        user,
      });
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve, reject) => {
        http.sendPostRequest(paths.DATA_ADMIN_APPS, tokens.serviceToken, {
          user,
        }, (err, response) => {
          if (err) {
            return reject(err);
          }
          expect(err).to.equal(null);
          expect(response.body).to.deep.equal({
            ok: true,
            result: expectedApps,
          });
          return resolve();
        });
      });
    }
  });
});
