import chai from 'chai';

import http from '../../../../../common/helpers/http';
import paths from '../../../../../common/helpers/paths';
import seed from '../../../../../common/seed';
import tokens from '../../../../../common/helpers/tokens';

const expect = chai.expect;

const baseAuthzName = `uds.bvt.authz.list.test.${seed.buildNumber}`;
const baseUrl = 'http://localhost:5200/authz';

const oneAuthz = {
  name: `${baseAuthzName}.1`,
  url: `${baseUrl}/1`,
};
const twoAuthz = {
  name: `${baseAuthzName}.2`,
  url: `${baseUrl}/2`,
};

describe('authz.list', () => {
  before(async () => {
    await seed.authz.addAuthz(oneAuthz);
    await seed.authz.addAuthz(twoAuthz);
  });

  after(seed.authz.removeAuthz([oneAuthz.name, twoAuthz.name]));

  it('should return the correct list of registered authz configurations', done => {
    new Promise((resolve, reject) => {
      http.sendPostRequest(paths.AUTHZ_LIST, tokens.serviceToken, {}, (err, response) => {
        if (err) {
          return reject(err);
        }

        expect(response).to.have.status(200);
        expect(response.body.ok).to.equal(true);

        expect(response.body.result).to.deep.include(oneAuthz);
        expect(response.body.result).to.deep.include(twoAuthz);

        return resolve();
      });
    }).then(done).catch(done);
  });
});
