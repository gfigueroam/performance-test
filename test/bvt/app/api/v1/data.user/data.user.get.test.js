import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.get.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.user.get', () => {
  apiTestStub('data.user', 'get', { key, user });
});
