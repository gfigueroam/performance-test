var AWS = require('aws-sdk');

var env = process.env.NODE_ENV || 'local';

// Load config based on the current environment
var configFilename = '../../database/config/db.' + env + '.json';
var config = require(configFilename);

// Configure the AWS package and initialize DB handle
var awsConfigFilename = './database/config/db.' + env + '.json';
AWS.config.loadFromPath(awsConfigFilename);

var db = new AWS.DynamoDB({
  region: 'us-east-1',
  apiVersion: '2012-10-08',
  endpoint: new AWS.Endpoint(config.endpoint)
});

// Load the standard schema for the calculate behavior table
var cbSchemaFilename = '../../database/schema/cb.json';
var cbSchema = require(cbSchemaFilename);

cbSchema.TableName = 'uds-' + env + '-calculated-behavior';

// Call DynamoDB to create the table for calculated behavior service
db.createTable(cbSchema, function(err, data) {
  if (err) {
    console.log('Error creating calculated-behavior table', err);
  } else {
    console.log('Success creating calculated-behavior table', cbSchema.TableName);
  }
});
