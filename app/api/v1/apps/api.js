/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

import infoHandler from './info';
import listHandler from './list';
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
