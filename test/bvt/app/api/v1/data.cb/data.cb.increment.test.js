import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.cb.increment.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.cb.increment', () => {
  apiTestStub('data.cb', 'increment', { key, user });
});
