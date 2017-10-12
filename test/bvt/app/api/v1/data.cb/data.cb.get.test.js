import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.cb.get.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.cb.get', () => {
  apiTestStub('data.cb', 'get', { key, user });
});
