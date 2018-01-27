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

eval "$CURL $AUTH $CTJ -d '{\"name\": \"APP1\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"
eval "$CURL $AUTH $CTJ -d '{\"name\": \"APP2\", \"quota\": 1024}' \"$ENDPOINT/api/v1/apps.register\" | jsonpp"

clear
###### Begin demo.

# Let's begin by calling data.user.set.
# With this sprint we've started to enforce the types, and maybe I can't quite
# recall the data types and I'm being a lazy engineer and don't want to look it up.
# I have a string I want to save, so let me try the type "string".
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"type\": \"string\", \"data\": \"I liked this.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Oh shoot, the type is "text" not "string". Let's try that again.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"type\": \"text\", \"data\": \"I liked this.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# So that was successful but I actually meant to store that as an annotation type.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"type\": \"annotation\", \"data\": \"I liked this.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Now that fails because annotation data must comply with the annotation schema.
# Let's fix it up and set the locator and text.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"type\": \"annotation\", \"data\": {\"locator\": {\"page\":5}, \"text\": \"I liked this.\"} }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Oh right an annotation also needs a createdAt timestamp.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"type\": \"annotation\", \"data\": {\"locator\": {\"page\":5}, \"createdAt\": 12325435435, \"text\": \"I liked this.\"} }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Now let's say this user wants to share their annotation with a friend.
# If the friend, user2, asks for user1's annotation directly using the owner and requestor parameters,
# the request is denied, because user2 is not user1's teacher. (although even if they were, the request
# would be denied as we have yet to implement that functionality)
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER2\", \"owner\": \"USER1\", \"key\": \"annotation.1.1.1\"}' \"$ENDPOINT/api/v1/data.user.get\" | jsonpp"

# We've provided two built-in authorization modes, uds_authz_allow and uds_authz_deny, which
# act as always-yes and always-no authorization modes. Basically the intent is to use these
# for testing, but if you wanted to share some data with anyone who has the share_id you could use
# uds_authz_allow. So let's have USER1 create two share_ids. For this first one we'll use uds_authz_allow.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"ctx\": \"irrelevant\", \"authz\": \"uds_authz_allow\" }' \"$ENDPOINT/api/v1/data.user.share\" | jsonpp"

# And let's make one with deny
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"USER1\", \"key\": \"annotation.1.1.1\", \"ctx\": \"irrelevant\", \"authz\": \"uds_authz_deny\" }' \"$ENDPOINT/api/v1/data.user.share\" | jsonpp"

# Now let's take the allow share ID and make a request with it as USER2.
echo "hint: take the allow share ID and try $CURL $AUTH $CTJ -d '{\"id\": \"\" }' \"$ENDPOINT/api/v1/data.user.getShared\" | jsonpp"
cmd

# And if we make the same request with the deny share ID -- it's like the authZ mode returned false -- we see
# that user2 cannot get the data.
echo "hint: take the deny share ID and try $CURL $AUTH $CTJ -d '{\"id\": \"\" }' \"$ENDPOINT/api/v1/data.user.getShared\" | jsonpp"
cmd

# Finally USER1 can unshare the allow shareID.
echo "hint: take the allow share ID and try $CURL $AUTH $CTJ -d '{\"requestor\":\"USER1\", \"id\": \"\" }' \"$ENDPOINT/api/v1/data.user.unshare\" | jsonpp"
cmd

# And once USER1 has unshared, USER2 cannot get the data.
echo "hint: take the allow share ID and try $CURL $AUTH $CTJ -d '{\"id\": \"\" }' \"$ENDPOINT/api/v1/data.user.getShared\" | jsonpp"
cmd

# finish
p ""
