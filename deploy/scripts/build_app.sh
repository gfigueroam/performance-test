#!/bin/bash

# Script to install packages, copy static resources, transpile code

echo Installing node app
npm install

echo Deleting and re-creating app_deploy folder
rm -rf app_deploy
mkdir -p app_deploy

echo Copying config and package.json
cp package.json app_deploy
cp -Rf config app_deploy/config

echo Copying libraries
cp -Rf node_modules app_deploy/node_modules

echo Building and copying API Docs
npm run build:apidocs
cp -Rf out app_deploy/out

echo Copying database config
cp -Rf database app_deploy/database

echo Copying static folder
cp -Rf static app_deploy/static

echo Transpiling source folders
./node_modules/.bin/babel app --out-dir app_deploy/app

echo Transpiling test folders
./node_modules/.bin/babel test --out-dir app_deploy/test
