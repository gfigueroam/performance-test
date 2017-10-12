/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

import appendHandler from './append';
import deleteHandler from './delete';
import getHandler from './get';
import getSharedHandler from './getShared';
import listHandler from './list';
import setHandler from './set';
import shareHandler from './share';
import unshareHandler from './unshare';

export default {
  'data.user.append': {
    handler: appendHandler,
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        // middleware.data.parseUserData, (Parse `data` based on `type`)
        // middleware.data.validateUserData, (Validate `data` based on `type`)
      ],
    },
  },
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
  },
  'data.user.list': {
    handler: listHandler,
    args: [
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
    metadata: {
      middleware: [
        // middleware.data.parseUserData, (Parse `data` based on `type`)
        // middleware.data.validateUserData, (Validate `data` based on `type`)
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
  },
};
/* eslint-enable sort-keys */
