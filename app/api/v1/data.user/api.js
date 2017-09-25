/* eslint-disable sort-keys */
import parsers from '../../parsers';

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
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
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
      },
    ],
  },
  'data.user.list': {
    handler: listHandler,
    args: [
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
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
      },
      {
        name: 'type',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'data',
        optional: false,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
    metadata: {
      middleware: [
        // middleware.data.parseUserData, (Parse `data` based on `type`)
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
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
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
      },
      {
        name: 'authz',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'ctx',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
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
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
};
/* eslint-enable sort-keys */
