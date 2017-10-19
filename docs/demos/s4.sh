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

export ENUM=colors
export SETTING=color
export CTJ="-X POST -H \"Content-Type: application/json\""
export CURL="curl"
export AUTH="-H \"Authorization: SIF_HMACSHA256 SE1IX0RNUFM6emFsZXVvbXdaNHp2OG1EaEY1M0JEMUNrMWFDQ0tCLzdCQlJoNENjMzVYZz0K\""


# Clean up stuff so we can run this more than once.

###### Begin demo.

# Missing auth
pe "$CURL $CTJ \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# Missing both key and user
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# Missing user
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# Missing key
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# Make a call with both key and user
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# finish
p ""
