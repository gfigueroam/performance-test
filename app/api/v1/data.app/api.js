/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

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
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        validate: validators.objects.validateTextData,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        validate: validators.strings.validateKey,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        validate: validators.strings.validateKey,
      },
      {
        name: 'app',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateApp,
      },
      {
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
  },
};
/* eslint-enable sort-keys */
