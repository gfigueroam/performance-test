/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';
import middleware from '../../../middleware';

import deleteHandler from './delete';
import getHandler from './get';
import listHandler from './list';
import mergeHandler from './merge';
import queryHandler from './query';
import setHandler from './set';

export default {
  'data.app.get': {
    handler: getHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.app.set': {
    handler: setHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'data',
        optional: false,
        parse: parsers.objects.parseJsonData,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.app.query': {
    handler: queryHandler,
    args: [
      {
        name: 'keyPrefix',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.app.list': {
    handler: listHandler,
    args: [
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.app.delete': {
    handler: deleteHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.app.merge': {
    handler: mergeHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'data',
        optional: false,
        parse: parsers.objects.parseJsonData,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'requestor',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
      {
        name: 'owner',
        optional: true,
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        middleware.auth.requireUserTokenOrRequestorParameter,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
};
/* eslint-enable sort-keys */
