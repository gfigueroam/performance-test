import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import config from '../../../../../../app/config';
import constants from '../../../../../../app/utils/constants';

import paths from '../../../../../common/helpers/paths';


const path = paths.APPS_LIST;
const endpoint = config.get('uds:url:internal');
const serviceToken = common.test.tokens.serviceToken;

const customCorrelationId = 'hmh-uds-bvt-correlation-id-123';

describe('correlation.id', () => {
  it('allows specifying a custom correlation id in the request header', done => {
    chai.request(endpoint)
      .get(path)
      .set('Authorization', serviceToken)
      .set(constants.UDS_BVT_REQUEST_HEADER, true)
      .set('x-swatch-request-id', customCorrelationId)
      .end((error, res) => {
        chai.expect(error).to.equal(null);
        chai.expect(res.body.ok).to.equal(true);

        chai.expect(res.headers['x-swatch-request-id']).to.equal(customCorrelationId);

        done(error);
      });
  });

  it('normally has a randomly generated correlation id in the response header', done => {
    chai.request(endpoint)
      .get(path)
      .set('Authorization', serviceToken)
      .set(constants.UDS_BVT_REQUEST_HEADER, true)
      .end((error, res) => {
        chai.expect(error).to.equal(null);
        chai.expect(res.body.ok).to.equal(true);

        chai.expect(res.headers['x-swatch-request-id']).not.to.equal(customCorrelationId);

        done(error);
      });
  });
});
