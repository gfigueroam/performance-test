import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.delete.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.user.delete', () => {
  apiTestStub('data.user', 'delete', { key, user });
});
