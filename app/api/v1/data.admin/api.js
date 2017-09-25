/* eslint-disable sort-keys */
import parsers from '../../parsers';

import appsHandler from './apps';
import usersHandler from './users';

export default {
  'data.admin.apps': {
    handler: appsHandler,
    args: [
      {
        name: 'realm',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'user',
        optional: false,
        parse: parsers.strings.parseString,
      },
    ],
  },
  'data.admin.users': {
    handler: usersHandler,
    args: [
      {
        name: 'realm',
        optional: false,
        parse: parsers.strings.parseString,
      },
    ],
  },
};
/* eslint-enable sort-keys */
