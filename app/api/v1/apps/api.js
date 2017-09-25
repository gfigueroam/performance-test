/* eslint-disable sort-keys */
import parsers from '../../parsers';

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
      },
      {
        name: 'password',
        parse: parsers.strings.parseOptionalString,
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
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
      },
      {
        name: 'password',
        optional: false,
        parse: parsers.strings.parseString,
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
      },
      {
        name: 'passwordId',
        optional: false,
        parse: parsers.strings.parseString,
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
      },
      {
        name: 'quota',
        optional: false,
        parse: parsers.numbers.parseQuota,
      },
    ],
  },
};
/* eslint-enable sort-keys */
