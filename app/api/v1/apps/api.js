/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';
import middleware from '../../../middleware';

import infoHandler from './info';
import listHandler from './list';
import registerHandler from './register';
import removeHandler from './remove';
import setPerUserQuotaHandler from './setPerUserQuota';

export default {
  'apps.register': {
    handler: registerHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
        validate: validators.numbers.validateQuota,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'apps.info': {
    handler: infoHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'apps.list': {
    handler: listHandler,
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'apps.remove': {
    handler: removeHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'apps.setPerUserQuota': {
    handler: setPerUserQuotaHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
        validate: validators.numbers.validateQuota,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
};
/* eslint-enable sort-keys */
