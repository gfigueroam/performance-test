import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;
const serviceToken = tokens.serviceToken;

const name = `uds.bvt.apps.passwords.add.test.${seed.buildNumber}`;
const password = 'password1234abcd';
const password2 = 'password2';
const quota = 1024;

function verifyNumberOfPasswords(expectedNumber) {
  return new Promise((resolve, reject) => {
    http.sendPostRequest(paths.APPS_INFO, serviceToken, {
      name,
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      // When there are no passwords the field is not returned.
      // To make comparisons easy, just make it a zero length array.
      if (!res.body.result.passwords) {
        res.body.result.passwords = [];
      }
      expect(res.body.result.passwords.length).to.equal(expectedNumber);

      return resolve();
    });
  });
}

function addPassword(pw) {
  return new Promise((resolve, reject) => {
    http.sendPostRequest(paths.APPS_PASSWORDS_ADD, serviceToken, {
      name,
      password: pw,
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      expect(res.body.ok).to.equal(true);
      return resolve();
    });
  });
}


describe('apps.passwords.add', () => {
  before((done) => {
    seed.apps.addApp({
      name,
      quota,
    })
    .then(done);
  });

  after(seed.apps.removeApps([name]));

  it('should throw an error for an invalid app', done => {
    const params = {
      name: 'badappname',
      password,
    };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;

    http.sendPostRequestError(paths.APPS_PASSWORDS_ADD, serviceToken, params, errorCode, done);
  });

  it('should successfully add a password to an existing app', done => {
    try {
      verifyNumberOfPasswords(0)
      .then(() => (addPassword(password)))
      .then(() => (verifyNumberOfPasswords(1)))
      .then(done)
      .catch(done);
    } catch (err) {
      expect(err).to.equal(false);
      done(err);
    }
  });

  it('should successfully add another password to an existing app', done => {
    try {
      verifyNumberOfPasswords(1)
      .then(() => (addPassword(password2)))
      .then(() => (verifyNumberOfPasswords(2)))
      .then(done)
      .catch(done);
    } catch (err) {
      expect(err).to.equal(false);
      done(err);
    }
  });
});
