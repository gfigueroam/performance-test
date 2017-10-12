import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.cb.decrement.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.cb.decrement', () => {
  apiTestStub('data.cb', 'decrement', { key, user });
});
