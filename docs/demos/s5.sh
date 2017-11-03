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

export AUTH="-H \"Authorization: \$TOKEN\""


# Clean up stuff so we can run this more than once.
npm run db:delete:local
npm run db:create:local
clear
###### Begin demo.

# Use an environment variable for authentication
pe "export TOKEN=\"SIF_HMACSHA256 SE1IX0RNUFM6emFsZXVvbXdaNHp2OG1EaEY1M0JEMUNrMWFDQ0tCLzdCQlJoNENjMzVYZz0K\""

# Let's see if we have a loginCount value for this user.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# No! Okay, so let's pretend this user logged in just now, and increment the non-existent value
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# Do we have a value now?
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# So let's say this user logs in three more times.
TYPE_SPEED=500
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"
TYPE_SPEED=50
# Let's see what the value is now
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Cool! Can we throw a lot requests, say 5?
pe "echo {\\\"key\\\": \\\"loginCount\\\", \\\"user\\\": \\\"USER1\\\"} > post.json"
pe "ab $AUTH -T \"application/json\" -T application/json -p post.json -n 5 $ENDPOINT/api/v1/data.cb.increment"

# So we we have the original 4, plus another 5, so we expect a total of 9.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Okay let's increment 50 times. But we don't want to wait, so we'll set the concurrency of apache bench to 10 requests.
# This means there will be 10 requests concurrent, and when one finishes, it'll send another, until a total
# of 50 have been sent. Please note that in the environments the DynamoDB capacity is not set high enough to
# allow for this test to succeed.
pe "ab $AUTH -T application/json -p post.json -n 50 -c 10 $ENDPOINT/api/v1/data.cb.increment"

# So we had 9, added 50. Do we have 59 total?
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Now let's do a quick demo of the decrement operation. It doesn't make any sense to decrement loginCount
# but let's say for some reason we want to.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.decrement\" | jsonpp"

# Now the value stored here is 58.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Next let's examine the merge operation. Merge allows you to take a JSON object and merge it with the value that
# is already stored at the key. Let's go ahead and try to merge some JSON object with the loginCount value.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\", \"data\": {\"aKey\": \"a value\"}}' \"$ENDPOINT/api/v1/data.cb.merge\" | jsonpp"

# We got an error, because the merge operation is only valid for an object, and not a number.
# So instead of merging into loginCount, let's use contentProgression as the key.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\", \"data\": {\"contentA\": {\"page\": 52}}}' \"$ENDPOINT/api/v1/data.cb.merge\" | jsonpp"

# Now let's check to make sure it was stored correctly.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Okay now let's say USER1 has started a second piece of content -- content B -- and made it to page 3. We don't
# want to overwrite their content progression object, we just want to store the new content progression for content B.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\", \"data\": {\"contentB\": {\"page\": 3}}}' \"$ENDPOINT/api/v1/data.cb.merge\" | jsonpp"

# Okay now let's see what this student's content progression is.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Cool, they are on page 52 in contentA and page 3 in contentB. Let's say they read another 5 pages in content B.
# Must be some boring subject, they're really moving slow.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\", \"data\": {\"contentB\": {\"page\": 8}}}' \"$ENDPOINT/api/v1/data.cb.merge\" | jsonpp"

pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# Now of course just like you couldn't merge into loginCount, you can't increment the contentProgression since it's storing an object and not a number.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"contentProgression\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.increment\" | jsonpp"

# UDS has no semantic knowledge of the keys though, so you need to be careful. UDS will let you overwrite the loginCount with an object.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\", \"data\": { \"key\": \"value\"}}' \"$ENDPOINT/api/v1/data.cb.set\" | jsonpp"

# And now the value stored under loginCount is no longer a number, but an object.
pe "$CURL $AUTH $CTJ -d '{\"key\": \"loginCount\", \"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.cb.get\" | jsonpp"

# finish
p ""
