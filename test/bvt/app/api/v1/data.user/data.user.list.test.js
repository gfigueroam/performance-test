import apiTestStub from '../stub';

const user = 'data.admin.test.user.1';

describe('data.user.list', () => {
  apiTestStub('data.user', 'list', { user });
});
