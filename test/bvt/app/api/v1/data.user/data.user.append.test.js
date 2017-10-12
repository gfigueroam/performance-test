import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.append.test.${seed.buildNumber}`;
const type = 'text';
const data = 'Test text content';
const user = 'data.admin.test.user.1';

describe('data.user.append', () => {
  apiTestStub('data.user', 'append', { data, key, type, user });
});
