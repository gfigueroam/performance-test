import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.apps.passwords.add.test.${seed.buildNumber}`;
const password = 'password1234abcd';

describe('apps.passwords.add', () => {
  apiTestStub('apps', 'passwords.add', { name, password });
});
