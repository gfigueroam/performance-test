#!/bin/bash

# Script for local development box to stop all running services

# Need to stop services from the docker-compose directory
echo Stopping services....
docker-compose stop
echo Done
