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

# We can call data.user.list to get a list of all the keys that this user has stored data under. We see this user has none.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\" }' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"

# Right now the only type that has been implemented is text, so let's store some text for this user, under the key KEY1
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\", \"type\": \"text\", \"key\": \"KEY1\", \"data\": \"some text for key1\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# We can use the data.user.get method to retrieve the data stored under a given key.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\", \"key\": \"KEY1\" }' \"$ENDPOINT/api/v1/data.user.get\" | jsonpp"

# We can register another key, KEY2.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\", \"type\": \"text\", \"key\": \"KEY2\", \"data\": \"this is completely different text under KEY2\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# If we call data.user.list again, we get back a response showing the user has data stored under both KEY1 and KEY2.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\" }' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"

# We can delete KEY1
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\", \"key\": \"KEY1\" }' \"$ENDPOINT/api/v1/data.user.delete\" | jsonpp"

# Once we do so, we cannot get the data again, since it’s been deleted.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\", \"key\": \"KEY1\" }' \"$ENDPOINT/api/v1/data.user.get\" | jsonpp"

# And the key is no longer returned from data.user.list.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\" }' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"


# We

# finish
p ""
