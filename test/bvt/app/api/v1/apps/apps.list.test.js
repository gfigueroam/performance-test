import chai from 'chai';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';
import constants from '../../../../../../app/utils/constants';

const path = paths.APPS_LIST;
const expect = chai.expect;

const quota = 1024;
const baseAppName = `uds.bvt.apps.list.test.${seed.buildNumber}`;
let numNamesUsed = 0;
const usedNames = [];

function registerNewApp() {
  return new Promise((resolve, reject) => {
    usedNames.push(`${baseAppName}.${numNamesUsed}`);
    numNamesUsed += 1; // ESLint forces this syntax rather than return usedNames[numNamesUsed++];
    const params = {
      name: usedNames[numNamesUsed - 1],
      quota: 1024,
    };
    http.sendPostRequestSuccess(paths.APPS_REGISTER, tokens.serviceToken, params, {
      ok: true,
    }, err => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

describe('apps.list', () => {
  after(async () => {
    await seed.apps.removeApps(usedNames);
  });

  it('should return the current number of registered apps', done => {
    function validate() {
      return new Promise((resolve, reject) => {
        http.sendPostRequest(path, tokens.serviceToken, {}, (err, response) => {
          if (err) {
            return reject(err);
          }
          expect(response).to.have.status(200);
          expect(response.body.ok).to.equal(true);

          // We cannot check the total, because in some environments non-BVT apps may exist
          // expect(response.body.result.length).to.equal(usedNames.length);
          usedNames.forEach((name) => {
            expect(response.body.result).to.deep.include({
              name,
              quota,
            });
          });

          // Make sure the built-in apps are not returned
          [constants.HMH_APP, constants.CB_APP].forEach((name) => {
            expect(response.body.result).not.to.deep.include({
              name,
              quota,
            });
          });
          return resolve();
        });
      });
    }
    registerNewApp()
    .then(validate)
    .then(registerNewApp)
    .then(validate)
    .then(registerNewApp)
    .then(validate)
    .then(done)
    .catch(done);
  });
});
