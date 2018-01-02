#!/bin/bash

########################
# include the magic
########################
. demo-magic.sh

#
# speed at which to simulate typing. bigger num = faster
#
TYPE_SPEED=50

#
# custom prompt
#
# see http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/bash-prompt-escape-sequences.html for escape sequences
#
DEMO_PROMPT="${GREEN}➜ ${CYAN}bash ${COLOR_RESET}$ "

# hide the evidence
clear

# Put your stuff here
#p "echo \"Pick your environment to test against...\""
export ENDPOINT=http://localhost:5200

export CTJ="-X POST -H \"Content-Type: application/json\""
export CURL="curl"

export AUTH="-H \"Authorization: \$TOKEN\""


# Clean up stuff so we can run this more than once.
npm run db:delete:local
npm run db:create:local
clear
###### Begin demo.

# Use an environment variable for authentication
export TOKEN="SIF_HMACSHA256 SE1IX0RNUFM6emFsZXVvbXdaNHp2OG1EaEY1M0JEMUNrMWFDQ0tCLzdCQlJoNENjMzVYZz0K"

# Today we're going to demo the application data APIs. For this demo we'll assume that we have an app called MyApp
# which uses UDS to store a preferences object. This was a common example for DMPS as well, but UDS does not
# allow policies to control the values unlike with DMPS. Let's start by checking
# if we have any data stored in MyApp under the key preferences for USER1.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\" }' \"$ENDPOINT/api/v1/data.app.json.get\" | jsonpp"

# Oh wait that didn't work, because we haven't registered the app in the system.
# Let's go ahead and do that. We'll give each user of this app a kilobyte of quota,
# although quota is not enforced at this time. This is something that only needs to
# happen once when an application is first developed.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"

# Okay now that we've create the app, let's query for this user's preferences in Myapp.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\" }' \"$ENDPOINT/api/v1/data.app.json.get\" | jsonpp"

# We see the user has no preferences. Let's say the user now goes in and stores a background color.
# We'll use the json merge API to merge in the background color.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\", \"data\": {\"bgColor\": \"white\"} }' \"$ENDPOINT/api/v1/data.app.json.merge\" | jsonpp"

# The merge method returns the merged result. Since the user hadn't stored
# anything previously, the merged result is just the background color.
# Let's say the user now wants to set their font to Helvetica.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\", \"data\": {\"font\": \"helvetica\"} }' \"$ENDPOINT/api/v1/data.app.json.merge\" | jsonpp"

# We could also retrieve the entire preferences value by calling get. This is what would
# likely happen when a user launches an app.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\" }' \"$ENDPOINT/api/v1/data.app.json.get\" | jsonpp"

# It is also possible to set the value directly. Maybe instead of setting one preference at a time,
# MyApp has a screen with all the preferences and it updates them all at once. We can set the preferences key
# to a new value altogether. Here we'll set the font to Courier New, and clear the background color.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\", \"data\": {\"font\": \"courier new\"} }' \"$ENDPOINT/api/v1/data.app.json.set\" | jsonpp"

# Let's say MyApp also stores some base-64 encoded binary data.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"binaryData\", \"data\": {\"base64\": \"IGtuZXcgeW91J2QgbG9vaw==\"} }' \"$ENDPOINT/api/v1/data.app.json.set\" | jsonpp"

# Over time maybe we've forgotten which keys the user has stored under MyApp, so we can list
# all the keys the user has.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.app.json.list\" | jsonpp"

# And of course we can delete the keys, one at a time. First we'll get rid of preferences.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"preferences\" }' \"$ENDPOINT/api/v1/data.app.json.delete\" | jsonpp"

# Then we'll get rid of binary Data.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\", \"key\": \"binaryData\" }' \"$ENDPOINT/api/v1/data.app.json.delete\" | jsonpp"

# Now we can check and see the user has nothing stored for MyApp.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"MyApp\", \"user\": \"USER1\" }' \"$ENDPOINT/api/v1/data.app.json.list\" | jsonpp"

# Let’s go ahead and remove Myapp from the applications to keep things neat and tidy.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\"}' \"$ENDPOINT/api/v1/apps.remove\" | jsonpp"

# finish
p ""
