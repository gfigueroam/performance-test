/* eslint-disable sort-keys */
import middleware from '../../../middleware';
import parsers from '../../parsers';
import validators from '../../validators';

import decrementHandler from './decrement';
import getHandler from './get';
import incrementHandler from './increment';
import mergeHandler from './merge';
import setHandler from './set';
import unsetHandler from './unset';

export default {
  'data.cb.decrement': {
    handler: decrementHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
  'data.cb.get': {
    handler: getHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
  'data.cb.increment': {
    handler: incrementHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
  'data.cb.merge': {
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
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
  'data.cb.set': {
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
        parse: parsers.objects.parseData,
      },
      {
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
  'data.cb.unset': {
    handler: unsetHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'requestor',
        optional: true,
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
        middleware.auth.requireUserTokenOrUserId,
      ],
    },
  },
};
/* eslint-enable sort-keys */
