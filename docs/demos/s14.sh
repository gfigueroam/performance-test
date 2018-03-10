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

# Use an environment variable for authentication
export TOKEN="SIF_HMACSHA256 SE1IX0RNUFM6emFsZXVvbXdaNHp2OG1EaEY1M0JEMUNrMWFDQ0tCLzdCQlJoNENjMzVYZz0K"

export CTJ="-X POST -H \"Content-Type: application/json\""
export CURL="curl"

export AUTH="-H \"Authorization: \$TOKEN\""


# Clean up stuff so we can run this more than once.
npm run db:delete:local
npm run db:create:local


clear
###### Begin demo.
# if you want an application without a quota, you have to register it with a
# quota using the same apps.register call you would have done previously.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"

# Then a second call to apps.removePerUserQuota removes the quota altogether.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\"}' \"$ENDPOINT/api/v1/apps.removePerUserQuota\" | jsonpp"

# If we call apps.info on our new app, we see there is no quota set.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\"}' \"$ENDPOINT/api/v1/apps.info\" | jsonpp"

# We can, of course, decide we want to add a quota after all and call
# apps.setPerUserQuota. This is somewhat risky as any user who makes use of the
# unlimited quota will likely be over whatever quota you set. While no data will
# be lost, the user will be unable to store new data for the app until they free
#up some quota.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\", \"quota\": 2048 }' \"$ENDPOINT/api/v1/apps.setPerUserQuota\" | jsonpp"

# Now if we call apps.info again, we see the app has a quota once again.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyApp\"}' \"$ENDPOINT/api/v1/apps.info\" | jsonpp"

# We also added a mechanism to access the calculated behavior data using the
# application data API. Let’s increment the login count for a user.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# We can query the login count using data.cb.get.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# With the change introduced in this sprint, we can also query using
# data.app.get, if we set the app to ‘cb’.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"cb\", \"requestor\": \"USER1\", \"key\": \"loginCount\" }' \"$ENDPOINT/api/v1/data.app.get\" | jsonpp"

# We can also update the value using data.app. methods.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"cb\", \"requestor\": \"USER1\", \"key\": \"loginCount\", \"data\": { \"value\": 10} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# We can read the change using both the data.cb.get method
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# ...and using the data.app.get method.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"cb\", \"requestor\": \"USER1\", \"key\": \"loginCount\" }' \"$ENDPOINT/api/v1/data.app.get\" | jsonpp"

# finish
p ""
