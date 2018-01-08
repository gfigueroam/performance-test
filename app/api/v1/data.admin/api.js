/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

import appsHandler from './apps';
import usersHandler from './users';

export default {
  'data.admin.apps': {
    handler: appsHandler,
    args: [
      {
        name: 'user',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateUser,
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
        validate: validators.strings.validateUserRealm,
      },
    ],
  },
};
/* eslint-enable sort-keys */
