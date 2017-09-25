import apiTestStub from '../stub';

const realm = 'json';
const user = 'data.admin.test.user.1';

describe('data.admin.apps', () => {
  apiTestStub('data.admin', 'apps', { realm, user });
});
