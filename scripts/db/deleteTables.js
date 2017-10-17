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

// Call DynamoDB to delete the table for calculated behavior service
var cbParams = {
  TableName: 'uds-' + env + '-calculated-behavior'
};
db.deleteTable(cbParams, function(err, data) {
  if (err && err.code === 'ResourceNotFoundException') {
    console.log('Error deleting calculated-behavior: Table not found', err);
  } else if (err && err.code === 'ResourceInUseException') {
    console.log('Error deleting calculated-behavior: Table in use', err);
  } else {
    console.log('Success deleting calculated-behavior table', data);
  }
});
