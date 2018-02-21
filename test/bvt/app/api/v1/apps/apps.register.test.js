import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.APPS_REGISTER;
const expect = chai.expect;

const baseAppName = `uds.bvt.apps.register.test.${seed.buildNumber}`;
const quota = 1024;
let numNamesUsed = 0;
const usedNames = [];
const OK = {
  ok: true,
};

function getName() {
  usedNames.push(`${baseAppName}.${numNamesUsed}`);
  numNamesUsed += 1; // ESLint forces this syntax rather than return usedNames[numNamesUsed++];
  return usedNames[numNamesUsed - 1];
}

describe('apps.register', () => {
  after(async () => {
    await seed.apps.removeApps(usedNames);
  });

  it('should throw an error for an invalid quota', done => {
    const params = {
      name: getName(),
      quota: 'abc',
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should return error when the request has a user token', done => {
    const params = { name: getName(), quota };
    const userToken = tokens.userTokens.internal;
    const errorCode = errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE;
    http.sendPostRequestError(path, userToken, params, errorCode, done);
  });

  it('should successfully register an app', done => {
    const name = getName();
    const params = {
      name,
      quota,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, params, OK, (err) => {
      expect(err).to.equal(null);

      // Make sure the app was stored correctly.
      http.sendPostRequest(paths.APPS_INFO, serviceToken, {
        name,
      }, (error, res) => {
        expect(error).to.equal(null);
        expect(res.body).to.deep.equal({
          ok: true,
          result: {
            name,
            quota,
          },
        });
        done();
      });
    });
  });

  it('should allow registering an app with a quota at precisely 1MB', done => {
    const params = {
      name: getName(),
      quota: 1024 * 1024,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, params, OK, done);
  });

  it('should reject registering an app with a quota over 1M', done => {
    const params = {
      name: getName(),
      quota: (1024 * 1024) + 1,
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should reject registering an app with a name which is already taken', done => {
    const params = {
      name: getName(),
      quota,
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_NAME_IN_USE;
    http.sendPostRequestSuccess(path, serviceToken, params, OK, err => {
      expect(err).to.equal(null);
      // Second call should fail, since it already exists
      http.sendPostRequestError(path, serviceToken, params, errorCode, done);
    });
  });
});
