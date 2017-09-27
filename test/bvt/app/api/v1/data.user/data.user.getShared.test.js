import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const id = `bvtshareid${seed.buildNumber}`;

describe('data.user.getShared', () => {
  apiTestStub('data.user', 'getShared', { id });
});
