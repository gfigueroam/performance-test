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

# First we can list all authorization modes present in the system.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/authz.list\" | jsonpp"

# There are none, because we haven’t registered any. We’re planning to build in some defaults, but for now let’s just add one. We need to give it a name, and an endpoint URL which will be called.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyAuthZMode\", \"url\": \"https://myauthz.hmhco.com/authorize\"}' \"$ENDPOINT/api/v1/authz.register\" | jsonpp"

# Now we can retrieve the list of all known authorization modes.
pe "$CURL $AUTH $CTJ \"$ENDPOINT/api/v1/authz.list\" | jsonpp"

# We can also see details about individual authorization modes.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyAuthZMode\"}' \"$ENDPOINT/api/v1/authz.info\" | jsonpp"

# And of course we can remove the authorization mode.
pe "$CURL $AUTH $CTJ -d '{\"name\": \"MyAuthZMode\"}' \"$ENDPOINT/api/v1/authz.remove\" | jsonpp"

# We’ve also added the data.admin.apps API. This API method allows you to get a list of apps which are storing data for a given user.
# Let’s store data for our user in APP1.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP1\", \"user\": \"USER1\", \"key\": \"preferences\", \"data\": {\"font\": \"helvetica\"} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# And let’s add another piece of data in APP2.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP2\", \"user\": \"USER1\", \"key\": \"preferences\", \"data\": {\"font\": \"times new roman\"} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# We can query and see that both APP1 and APP2 have data for this user.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.admin.apps\" | jsonpp"

# We can remove the data in APP1.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP1\", \"user\": \"USER1\", \"key\": \"preferences\" }' \"$ENDPOINT/api/v1/data.app.delete\" | jsonpp"

# And maybe let’s add a second piece of data to APP2.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP2\", \"user\": \"USER1\", \"key\": \"username\", \"data\": {\"display\": \"michal\"} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# Now we can query and we see only APP2 is returned, because APP1 is no longer storing data for the user.
pe "$CURL $AUTH $CTJ -d '{\"user\": \"USER1\"}' \"$ENDPOINT/api/v1/data.admin.apps\" | jsonpp"

# Finally we’ve added quota enforcement for the application data APIs. If we store a third key for APP2 for this user, it succeeds.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP2\", \"user\": \"USER1\", \"key\": \"access\", \"data\": {\"ip\": \"127.0.0.1\"} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# But let’s add a really long string of data, to exceed to 1KB quota.
pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP2\", \"user\": \"USER1\", \"key\": \"access\", \"data\": {\"super long text\": \"As we move more toward digital learning and innovation in our schools, our ability to show the impact—not just talk about it—is at the root of any successful implementation. School leaders and teachers must be able to articulate the why, how, and what, and the detailed process that drives each respective change effort—as well as the resulting qualitative and quantitative data. School and district leaders are continually in search of tools and processes that can help them measure the impact of the changes they are implementing. Practices such as Bring Your Own Device (BYOD), 1:1 technology, blended learning, personalized learning, classroom and school redesign, branding, makerspaces, and professional learning can all lead practitioners to ask: “How do we determine the effectiveness of our latest initiative?” Among the many services and tools available to help districts, schools, and organizations transform teaching, learning, and leadership, one that warrants close attention is the International Center for Leadership in Education’s (ICLE) Digital Practice Assessment (DPA).\"} }' \"$ENDPOINT/api/v1/data.app.set\" | jsonpp"

# We see we got an error. We can try and merge our long piece of data into an existing key.

pe "$CURL $AUTH $CTJ -d '{\"app\": \"APP2\", \"user\": \"USER1\", \"key\": \"access\", \"data\": {\"super long text\": \"As we move more toward digital learning and innovation in our schools, our ability to show the impact—not just talk about it—is at the root of any successful implementation. School leaders and teachers must be able to articulate the why, how, and what, and the detailed process that drives each respective change effort—as well as the resulting qualitative and quantitative data. School and district leaders are continually in search of tools and processes that can help them measure the impact of the changes they are implementing. Practices such as Bring Your Own Device (BYOD), 1:1 technology, blended learning, personalized learning, classroom and school redesign, branding, makerspaces, and professional learning can all lead practitioners to ask: “How do we determine the effectiveness of our latest initiative?” Among the many services and tools available to help districts, schools, and organizations transform teaching, learning, and leadership, one that warrants close attention is the International Center for Leadership in Education’s (ICLE) Digital Practice Assessment (DPA).\"} }' \"$ENDPOINT/api/v1/data.app.merge\" | jsonpp"
# This also fails because the quota is enforced both when calling data.app.set and when calling data.app.merge.

# finish
p ""
