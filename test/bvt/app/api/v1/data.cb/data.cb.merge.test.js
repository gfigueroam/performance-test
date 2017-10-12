import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.cb.merge.test.${seed.buildNumber}`;
const data = { k1: 'Hello', k2: 'Goodbye' };
const user = 'data.admin.test.user.1';

describe('data.cb.merge', () => {
  apiTestStub('data.cb', 'merge', { data, key, user });
});
