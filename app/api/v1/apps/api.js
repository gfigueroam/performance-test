/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

import infoHandler from './info';
import listHandler from './list';
import passwordsAddHandler from './passwords.add';
import passwordsRemoveHandler from './passwords.remove';
import registerHandler from './register';
import removeHandler from './remove';
import setPerUserQuotaHandler from './setPerUserQuota';

export default {
  'apps.register': {
    handler: registerHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
        validate: validators.strings.validateOptionalPassword,
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
        validate: validators.numbers.validateQuota,
      },
    ],
  },
  'apps.info': {
    handler: infoHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
    ],
  },
  'apps.list': {
    handler: listHandler,
  },
  'apps.remove': {
    handler: removeHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
    ],
  },
  'apps.passwords.add': {
    handler: passwordsAddHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'password',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validatePassword,
      },
    ],
  },
  'apps.passwords.remove': {
    handler: passwordsRemoveHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'passwordId',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validatePasswordId,
      },
    ],
  },
  'apps.setPerUserQuota': {
    handler: setPerUserQuotaHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateName,
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
        validate: validators.numbers.validateQuota,
      },
    ],
  },
};
/* eslint-enable sort-keys */
