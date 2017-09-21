#!/bin/bash

# Script for local development box to package app, create Dockerfile
#  locally, and launch full suite of UDS services via docker-compose

# Run build script to compile Node app and create deploy directory
echo Building app....
npm run build:app
echo Done

echo Building Docker....
npm run docker:local
echo Done

# Use docker compose to bring up local container
echo Starting....
docker-compose up
