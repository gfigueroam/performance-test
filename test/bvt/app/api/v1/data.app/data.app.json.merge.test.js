import chai from 'chai';

import http from '../../../../../common/helpers/http';
import seed from '../../../../../common/seed';
import paths from '../../../../../common/helpers/paths';
import tokens from '../../../../../common/helpers/tokens';
import errors from '../../../../../../app/models/errors';

const expect = chai.expect;

const app = `uds.bvt.data.app.json.merge.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.json.merge.test.${seed.buildNumber}`;
const user = 'data.user.test.user.1';
const data = {
  key1: true,
  key2: 'some string',
  key3: [1, 2, 3],
};

describe('data.app.json.merge', () => {
  before(async () => {
    await seed.apps.addApp({
      name: app,
      quota: 1024,
    });
  });

  after(async () => {
    await seed.apps.removeApps([app]);

    await seed.app.removeJson({
      app,
      key,
      user,
    });
  });

  it('throws invalid_app when the app contains invalid characters', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app: 'invalid-app-name',
      data,
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
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app: 'non.existent.app',
      data,
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

  it('throws an error when data is not JSON', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app,
      data: 'some invalid data',
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        error: errors.codes.ERROR_CODE_INVALID_DATA,
        ok: false,
      });
      done();
    });
  });

  it('successfully stores when there is nothing previously stored', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app,
      data,
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data,
          key,
        },
      });

      http.sendPostRequest(paths.DATA_APP_JSON_GET, tokens.serviceToken, {
        app,
        key,
        user,
      }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
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

  it('successfully merges a new key into the existing data', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app,
      data: {
        key4: {
          s: 'some string here',
        },
      },
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              s: 'some string here',
            },
          },
          key,
        },
      });

      http.sendPostRequest(paths.DATA_APP_JSON_GET, tokens.serviceToken, {
        app,
        key,
        user,
      }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
          result: {
            data: {
              key1: data.key1,
              key2: data.key2,
              key3: data.key3,
              key4: {
                s: 'some string here',
              },
            },
            key,
          },
        });
        done();
      });
    });
  });

  it('successfully overwrites an existing key within existing data', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app,
      data: {
        key4: {
          b: true,
        },
      },
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              b: true,
            },
          },
          key,
        },
      });

      http.sendPostRequest(paths.DATA_APP_JSON_GET, tokens.serviceToken, {
        app,
        key,
        user,
      }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
          result: {
            data: {
              key1: data.key1,
              key2: data.key2,
              key3: data.key3,
              key4: {
                b: true,
              },
            },
            key,
          },
        });
        done();
      });
    });
  });

  it('successfully overwrites an existing key and adds a new one within existing data', (done) => {
    http.sendPostRequest(paths.DATA_APP_JSON_MERGE, tokens.serviceToken, {
      app,
      data: {
        key4: {
          i: 7,
        },
        key5: 'whatever',
      },
      key,
      user,
    }, (err, response) => {
      expect(err).to.equal(null);
      expect(response.body).to.deep.equal({
        ok: true,
        result: {
          data: {
            key1: data.key1,
            key2: data.key2,
            key3: data.key3,
            key4: {
              i: 7,
            },
            key5: 'whatever',
          },
          key,
        },
      });

      http.sendPostRequest(paths.DATA_APP_JSON_GET, tokens.serviceToken, {
        app,
        key,
        user,
      }, (err2, response2) => {
        expect(err2).to.equal(null);
        expect(response2.body).to.deep.equal({
          ok: true,
          result: {
            data: {
              key1: data.key1,
              key2: data.key2,
              key3: data.key3,
              key4: {
                i: 7,
              },
              key5: 'whatever',
            },
            key,
          },
        });
        done();
      });
    });
  });
});
