import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.authz.info.test.${seed.buildNumber}`;

describe('authz.info', () => {
  apiTestStub('authz', 'info', { name });
});
