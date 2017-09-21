/* eslint-disable sort-keys */
import blobDeleteHandler from './blob.delete';
import blobGetHandler from './blob.get';
import blobSetHandler from './blob.set';
import jsonDeleteHandler from './json.delete';
import jsonGetHandler from './json.get';
import jsonListHandler from './json.list';
import jsonMergeHandler from './json.merge';
import jsonSetHandler from './json.set';

export default {
  'data.app.blob.get': {
    handler: blobGetHandler,
    args: [
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.blob.set': {
    handler: blobSetHandler,
    args: [
      {
        name: 'data',
        optional: false,
      },
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.blob.delete': {
    handler: blobDeleteHandler,
    args: [
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.json.get': {
    handler: jsonGetHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.json.set': {
    handler: jsonSetHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'data',
        optional: false,
      },
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.json.list': {
    handler: jsonListHandler,
    args: [
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.json.delete': {
    handler: jsonDeleteHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
  'data.app.json.merge': {
    handler: jsonMergeHandler,
    args: [
      {
        name: 'key',
        optional: false,
      },
      {
        name: 'data',
        optional: false,
      },
      {
        name: 'app',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'user',
      },
    ],
  },
};
/* eslint-enable sort-keys */
