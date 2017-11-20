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

# We can get a list of all applications in the system. Here we see there are none.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/apps.list\" | jsonpp"

# We can register a new application. Each application has a name, and a quota. The quota limits how much data each user is allowed to store in each application.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP1\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"

# We can also register a new application with a password. Calls to store data for this application will require the password.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\", \"password\":\"secret_password\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"

# Now if we list the available applications, we see both of our applications.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/apps.list\" | jsonpp"

# We can get details on the application with the password.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\"}' \"$ENDPOINT/api/v1/apps.info\" | jsonpp"

# We can also add a new password to the application. Doing so supports password rotation, since the new password can be added to the application, and calls with either the old or the new password will succeed. Clients can then be updated to use the new password, and once all clients have the new password, the old password can be removed.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\", \"password\": \"new_secret_password\"}' \"$ENDPOINT/api/v1/apps.passwords.add\" | jsonpp"

# Speaking of removing passwords, let’s remove the old password.
# We can get the application info again to confirm the old password was removed.
echo "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\", \"passwordId\": \"CHANGE_ME\"}' \"$ENDPOINT/api/v1/apps.passwords.remove\" | jsonpp"
cmd

# We can also update the quota for an application. Let’s say we want to update the first app to allow 2KB for each user.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP1\", \"quota\": 2048}' \"$ENDPOINT/api/v1/apps.setPerUserQuota\" | jsonpp"

# We’ll get the app info again to confirm.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP1\"}' \"$ENDPOINT/api/v1/apps.info\" | jsonpp"

# We can also remove apps from the system.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\"}' \"$ENDPOINT/api/v1/apps.remove\" | jsonpp"

# If we list all apps in the system, we see only one now.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/apps.list\" | jsonpp"

# Let’s go ahead and remove the other one too, since it’s always nice to leave things neat and tidy.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"APP1\"}' \"$ENDPOINT/api/v1/apps.remove\" | jsonpp"

# And voila, an empty database.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/apps.list\" | jsonpp"

# finish
p ""
