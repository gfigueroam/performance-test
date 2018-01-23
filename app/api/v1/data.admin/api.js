/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';
import middleware from '../../../middleware';

import appsHandler from './apps';

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
    metadata: {
      middleware: [
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
};
/* eslint-enable sort-keys */
