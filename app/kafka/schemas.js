/* eslint-disable sort-keys */
import avro from 'avsc';

// Define schema for an event emitted to UDS describing calculated behavior
// {
//   key: 'unique_key',
//   user: 'user_guid',
//   operation: 'set',
//   data: '["v1", "v2", "v3"]'
// }
const cb = avro.Type.forSchema({
  namespace: 'com.hmhco.uds',
  doc: 'Represents a calculated behavior event to store for a user',
  type: 'record',
  name: 'calculated.behavior',
  fields: [
    {
      name: 'key',
      type: 'string',
      doc: 'A unique key set by client to identify the data element',
    },
    {
      name: 'user',
      type: 'string',
      doc: 'The unique ID of the user',
    },
    {
      name: 'operation',
      type: {
        type: 'enum',
        name: 'supportedOperations',
        symbols: [
          'increment',
          'merge',
          'decrement',
          'set',
          'unset',
        ],
      },
      doc: 'The requested operation type',
    },
    {
      name: 'data',
      type: [
        'null',
        'string',
        'double',
        'boolean',
        {
          // Arrays (of any type) and JSON objects (of any shape)
          type: 'record',
          name: 'serializedArrayOrJson',
          fields: [
            {
              name: 'json',
              type: 'string',
            },
          ],
        },
      ],
      doc: 'The data element to store in UDS',
    },
  ],
});

export default {
  cb,
};
/* eslint-enable sort-keys */
