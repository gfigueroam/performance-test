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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'authz.list': {
    handler: listHandler,
    metadata: {
      middleware: [
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
};
/* eslint-enable sort-keys */
