#!/bin/bash

# Delete the packaged root app_deploy folder
echo Removing app_deploy folders....
rm -rf app_deploy
echo Done

# Delete any auto-generated API or JSDoc files
echo Removing API/JSDoc folders....
rm -rf out
echo Done

# Delete the auto-generated Swagger doc file
echo Removing Swagger doc JSON...
rm -rf static/swagger/api-docs.json
echo Done

# Delete code coverage info from previous runs
echo Removing code coverage folders....
rm -rf coverage
rm -rf .nyc_output
echo Done
