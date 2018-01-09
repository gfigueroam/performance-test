/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

import deleteHandler from './delete';
import getHandler from './get';
import listHandler from './list';
import mergeHandler from './merge';
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
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
        name: 'user',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalUser,
      },
    ],
  },
};
/* eslint-enable sort-keys */
