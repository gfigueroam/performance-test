import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.set.test.${seed.buildNumber}`;
const type = 'text';
const data = 'Test text content';
const user = 'data.admin.test.user.1';

describe('data.user.set', () => {
  apiTestStub('data.user', 'set', { data, key, type, user });
});
