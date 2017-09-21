/* eslint-disable sort-keys */
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
      },
      {
        name: 'user',
      },
    ],
  },
  'data.user.getShared': {
    handler: getSharedHandler,
    args: [
      {
        name: 'id',
        optional: false,
      },
    ],
  },
  'data.user.list': {
    handler: listHandler,
    args: [
      {
        name: 'user',
      },
    ],
  },
  'data.user.set': {
    handler: setHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'type',
        optional: false,
      },
      {
        name: 'data',
        optional: false,
      },
      {
        name: 'user',
      },
    ],
  },
  'data.user.delete': {
    handler: deleteHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'user',
      },
    ],
  },
  'data.user.share': {
    handler: shareHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'authz',
        optional: false,
      },
      {
        name: 'ctx',
        optional: false,
      },
      {
        name: 'user',
      },
    ],
  },
  'data.user.unshare': {
    handler: unshareHandler,
    args: [
      {
        name: 'id',
        optional: false,
      },
      {
        name: 'user',
      },
    ],
  },
};
/* eslint-enable sort-keys */
