import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.requestor.append.test.${seed.buildNumber}`;
const type = 'text';
const data = 'Test text content';
const requestor = 'data.admin.test.requestor.1';

describe('data.user.append', () => {
  apiTestStub('data.user', 'append', { data, key, requestor, type });
});
