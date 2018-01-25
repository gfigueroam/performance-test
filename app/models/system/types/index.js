import Ajv from 'ajv';
import glob from 'glob';

const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const types = {
  text: {
    validate: data => Object.prototype.toString.call(data) === '[object String]',
  },
};

// Load all schema-based types from <typename>.json in the current directory
const schemas = glob.sync('*.json', {
  cwd: './app/models/system/types',
});

schemas.forEach((schema) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const validator = ajv.compile(require(`${__dirname}/${schema}`));
  types[schema.substring(0, schema.length - '.json'.length)] = {
    validate: data => validator(data),
  };
});


export default types;
