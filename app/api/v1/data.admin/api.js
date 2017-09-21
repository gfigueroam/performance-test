/* eslint-disable sort-keys */
import appsHandler from './apps';
import usersHandler from './users';

export default {
  'data.admin.apps': {
    handler: appsHandler,
    args: [
      {
        name: 'realm',
        optional: false,
      },
      {
        name: 'user',
        optional: false,
      },
    ],
  },
  'data.admin.users': {
    handler: usersHandler,
    args: [
      {
        name: 'realm',
        optional: false,
      },
    ],
  },
};
/* eslint-enable sort-keys */
