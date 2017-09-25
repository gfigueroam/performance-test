import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const id = `uds.bvt.data.user.getShared.test.${seed.buildNumber}`;

describe('data.user.getShared', () => {
  apiTestStub('data.user', 'getShared', { id });
});
