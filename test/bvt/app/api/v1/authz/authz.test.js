import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

describe('Authz API', () => {
  apiTestStub('authz', 'register', {
    name: `uds.bvt.authz.register.test.${seed.buildNumber}`,
    url: 'https://hmheng-uds.test.app/callback',
  });
  apiTestStub('authz', 'info', {
    name: `uds.bvt.authz.info.test.${seed.buildNumber}`,
  });
  apiTestStub('authz', 'list', {});
  apiTestStub('authz', 'remove', {
    name: `uds.bvt.authz.remove.test.${seed.buildNumber}`,
  });
});
