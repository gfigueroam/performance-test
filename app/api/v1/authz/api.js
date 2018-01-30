/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';
import middleware from '../../../middleware';

import infoHandler from './info';
import listHandler from './list';
import registerHandler from './register';
import removeHandler from './remove';

export default {
  'authz.register': {
    handler: registerHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'url',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateURL,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'authz.info': {
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
  'authz.list': {
    handler: listHandler,
    metadata: {
      middleware: [
        middleware.auth.requireServiceToken,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'authz.remove': {
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
};
/* eslint-enable sort-keys */
