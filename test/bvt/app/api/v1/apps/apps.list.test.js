import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import constants from '../../../../../../app/utils/constants';
import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';


const expect = chai.expect;

const baseAppName = `uds.bvt.apps.list.test.${seed.buildNumber}`;

const app1 = `${baseAppName}.0`;
const app2 = `${baseAppName}.1`;
const app3 = `${baseAppName}.2`;
const quota = 1024;

const path = paths.APPS_LIST;
const token = common.test.tokens.serviceToken;

const OK = { ok: true };


function validateApps(appNames, nonAppNames, done) {
  http.sendPostRequest(paths.APPS_LIST, token, {}, (err, res) => {
    expect(res).to.have.status(200);
    expect(res.body.ok).to.equal(true);

    // We cannot check the total, because in some environments non-BVT apps may exist
    //  so just check that all app names listed in 'appNames' are present in result
    appNames.forEach(name => {
      expect(res.body.result).to.deep.include({ name, quota });
    });

    // Also check that app names in nonAppNames are not found yet
    nonAppNames.forEach(name => {
      expect(res.body.result).not.to.deep.include({ name, quota });
    });

    // Make sure the built-in apps are not returned
    [constants.HMH_APP, constants.CB_APP].forEach(name => {
      expect(res.body.result).not.to.deep.include({ name, quota });
    });
    return done(err);
  });
}

function registerNewApp(name, done) {
  const registerPath = paths.APPS_REGISTER;
  const params = { name, quota };
  http.sendPostRequestSuccess(registerPath, token, params, OK, done);
}

describe('apps.list', () => {
  after(async () => {
    await seed.apps.removeApps([app1, app2, app3]);
  });

  it('should find no registered apps initially', done => {
    validateApps([], [app1, app2, app3], done);
  });

  it('should register a single app and retrieve it', done => {
    registerNewApp(app1, () => {
      validateApps([app1], [app2, app3], done);
    });
  });

  it('should register another app and retrieve both', done => {
    registerNewApp(app2, () => {
      validateApps([app1, app2], [app3], done);
    });
  });

  it('should register a final app and retrieve them all', done => {
    registerNewApp(app3, () => {
      validateApps([app1, app2, app3], [], done);
    });
  });

  it('should return an error for a user token', done => {
    const userToken = common.test.tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, {}, errorCode, done);
  });
});
