import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.authz.register.test.${seed.buildNumber}`;
const url = 'https://hmheng-uds.test.app/callback';

describe('authz.register', () => {
  apiTestStub('authz', 'register', { name, url });
});
