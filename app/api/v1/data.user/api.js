/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';
import middleware from '../../../middleware';

import deleteHandler from './delete';
import getHandler from './get';
import getSharedHandler from './getShared';
import listHandler from './list';
import setHandler from './set';
import shareHandler from './share';
import unshareHandler from './unshare';

export default {
  'data.user.get': {
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.getShared': {
    handler: getSharedHandler,
    args: [
      {
        name: 'id',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateShareId,
      },
    ],
    metadata: {
      middleware: [
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.list': {
    handler: listHandler,
    args: [
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.set': {
    handler: setHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'type',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateType,
      },
      {
        name: 'data',
        optional: false,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.data.validateUserDataType,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.delete': {
    handler: deleteHandler,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.share': {
    handler: shareHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateKey,
      },
      {
        name: 'authz',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateAuthz,
      },
      {
        name: 'ctx',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateCtx,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
  'data.user.unshare': {
    handler: unshareHandler,
    args: [
      {
        name: 'id',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateShareId,
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
        // TODO: mbryc - middleware.auth.requireUserTokenOrUserId,
        middleware.database.ensureReadConsistency,
      ],
    },
  },
};
/* eslint-enable sort-keys */
