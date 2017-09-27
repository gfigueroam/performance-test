import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const id = `bvtunshareid${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.user.unshare', () => {
  apiTestStub('data.user', 'unshare', { id, user });
});
