import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.apps.passwords.remove.test.${seed.buildNumber}`;
const passwordId = 'password.test.id.12345';

describe('apps.passwords.remove', () => {
  apiTestStub('apps', 'passwords.remove', { name, passwordId });
});
