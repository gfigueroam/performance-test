import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.authz.remove.test.${seed.buildNumber}`;

describe('authz.remove', () => {
  apiTestStub('authz', 'remove', { name });
});
