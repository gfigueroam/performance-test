import chai from 'chai';
import sinon from 'sinon';

import common from 'hmh-bfm-nodejs-common';

import metrics from '../../../../app/models/metrics';
import logger from '../../../../app/monitoring/logger';

const expect = chai.expect;


describe('db.client', () => {
  it('should initialize a dyanmo db client', () => {
    sinon.stub(common.dynamo.client, 'init').callsFake((c, m, l) => {
      expect(c).to.deep.equal({
        database: {
          apiVersion: '2012-08-10',
          credentials: {
            accessKeyId: 'testAccessKey',
            secretAccessKey: 'testSecretAccessKey',
          },
          endpoint: 'none',
          region: 'us-east-1',
        },
        iamRole: 'test:arn:aws:iam::711638685743:role/uds/uds-iam-ddb-role-test',
      });
      expect(m).to.deep.equal(metrics.labels);
      expect(l).to.deep.equal(logger);
    });

    // eslint-disable-next-line global-require
    require('../../../../app/db/client');

    common.dynamo.client.init.restore();
  });
});
