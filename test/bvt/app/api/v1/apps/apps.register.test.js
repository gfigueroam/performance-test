import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const path = paths.APPS_REGISTER;
const expect = chai.expect;

const baseAppName = `uds.bvt.apps.register.test.${seed.buildNumber}`;
const password = 'password1234abcd';
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
  after(seed.apps.removeApps(usedNames));

  it('should throw an error for an invalid quota', done => {
    const params = {
      name: getName(),
      password,
      quota: 'abc',
    };
    const serviceToken = tokens.serviceToken;
    const errorCode = errors.codes.ERROR_CODE_INVALID_QUOTA;

    http.sendPostRequestError(path, serviceToken, params, errorCode, done);
  });

  it('should successfully register an app without a password', done => {
    const params = {
      name: getName(),
      quota,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, params, OK, done);
  });

  it('should successfully register an app with a password', done => {
    const name = getName();
    const params = {
      name,
      password,
      quota,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, params, OK, (err) => {
      expect(err).to.equal(null);

      // Make sure the password is not stored in plaintext.
      http.sendPostRequest(paths.APPS_INFO, serviceToken, {
        name,
      }, (error, res) => {
        expect(error).to.equal(null);
        expect(res.body.ok).to.equal(true);
        expect(res.body.result.name).to.equal(name);
        expect(res.body.result.quota).to.equal(quota);
        expect(res.body.result.passwords.length).to.equal(1);
        expect(res.body.result.passwords[0]).not.to.equal(password);
        done();
      });
    });
  });

  it('should allow registering an app with a quota at precisely 1MB', done => {
    const params = {
      name: getName(),
      password,
      quota: 1024 * 1024,
    };
    const serviceToken = tokens.serviceToken;

    http.sendPostRequestSuccess(path, serviceToken, params, OK, done);
  });

  it('should reject registering an app with a quota over 1M', done => {
    const params = {
      name: getName(),
      password,
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
