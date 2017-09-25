/* eslint-disable sort-keys */
import parsers from '../../parsers';

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
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.blob.set': {
    handler: blobSetHandler,
    args: [
      {
        name: 'data',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.blob.delete': {
    handler: blobDeleteHandler,
    args: [
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.json.get': {
    handler: jsonGetHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.json.set': {
    handler: jsonSetHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'data',
        optional: false,
        parse: parsers.objects.parseData,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.json.list': {
    handler: jsonListHandler,
    args: [
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.json.delete': {
    handler: jsonDeleteHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
  'data.app.json.merge': {
    handler: jsonMergeHandler,
    args: [
      {
        name: 'key',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'data',
        optional: false,
        parse: parsers.objects.parseData,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
      },
    ],
  },
};
/* eslint-enable sort-keys */
