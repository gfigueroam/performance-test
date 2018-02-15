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

# First we’ll call data.user.list and see our user has no user data stored in UDS.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"

# Let’s say we are a student reading through module 4 of content A and we find something really interesting we want to highlight. We’ll go ahead and store an annotation.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.contentA.module4.1\", \"type\": \"text\", \"data\": \"I liked this.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# The next day we’re reading module 5, and we want to make another annotation.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.contentA.module5.1\", \"type\": \"text\", \"data\": \"This will be covered by the quiz.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Now we can list all of our user data, and we see both annotations are present.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"

# Let’s say we want to share our annotation from module 5 with a friend. We’ll call data.user.share and use the built-in uds_authz_allow mode.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.contentA.module5.1\", \"ctx\": \"irrelevant\", \"authz\": \"uds_authz_allow\" }' \"$ENDPOINT/api/v1/data.user.share\" | jsonpp"

# If we call data.user.list again, we see we still have the two annotations and that we have one shared item.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\"}' \"$ENDPOINT/api/v1/data.user.list\" | jsonpp"

# The other big thing we implemented this sprint is the addition of 3 query API methods, one each for user data, application data, and calculated behavior data. Since they all work similarly, I’ll just demo the data.user.query method.
# Let’s add a third annotation, this time in module 1 of content B.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.contentB.module1.1\", \"type\": \"text\", \"data\": \"Really sharp!\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Data.user.list allows us to get a list of all of a user’s keys stored in UDS, but we are perhaps interested in only annotations.
# We can query using the key prefix annotation to get just the annotations.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"keyPrefix\": \"annotation\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# Since we’ve been careful in how we’ve structured our keys, if we need only the annotations for content A, we can get just the two annotations stored for content A.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"keyPrefix\": \"annotation.contentA\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# Of course if we want just the annotations for content A module 5, we can do that as well.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"keyPrefix\": \"annotation.contentA.module5\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# finish
p ""
