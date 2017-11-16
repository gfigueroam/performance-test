import chai from 'chai';

import errors from '../../../../../../app/models/errors';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;
const serviceToken = tokens.serviceToken;

const name = `uds.bvt.apps.passwords.remove.test.${seed.buildNumber}`;
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

function removePasswordId(passwordId) {
  return new Promise((resolve, reject) => {
    http.sendPostRequest(paths.APPS_PASSWORDS_REMOVE, serviceToken, {
      name,
      passwordId,
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      expect(res.body.ok).to.equal(true);
      return resolve();
    });
  });
}


describe('apps.passwords.remove', () => {
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
      passwordId: 'somepasswordid',
    };
    const errorCode = errors.codes.ERROR_CODE_APP_NOT_FOUND;

    http.sendPostRequestError(paths.APPS_PASSWORDS_REMOVE, serviceToken, params, errorCode, done);
  });

  // Adding a password is expensive in latency so we only add one per test,
  // to avoid blowing the mocha timeout.
  it('should successfully add a password', done => {
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

  // Adding a password is expensive in latency so we only add one per test,
  // to avoid blowing the mocha timeout.
  it('should successfully add another password', done => {
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

  it('should remove passwords', done => {
    http.sendPostRequest(paths.APPS_INFO, serviceToken, {
      name,
    }, (error, res) => {
      expect(error).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result.name).to.equal(name);
      expect(res.body.result.quota).to.equal(quota);
      expect(res.body.result.passwords.length).to.equal(2);
      expect(res.body.result.passwords[0]).not.to.equal(password);
      expect(res.body.result.passwords[0]).not.to.equal(password2);
      expect(res.body.result.passwords[1]).not.to.equal(password);
      expect(res.body.result.passwords[1]).not.to.equal(password2);
      const passwordId1 = res.body.result.passwords[0];
      const passwordId2 = res.body.result.passwords[1];
      removePasswordId(passwordId1)
      .then(() => (verifyNumberOfPasswords(1)))
      .then(() => (removePasswordId(passwordId2)))
      .then(() => (verifyNumberOfPasswords(0)))
      .then(done)
      .catch(done);
    });
  });
});
