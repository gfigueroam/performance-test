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
export SKIP_IDS="-H \"x-hmh-uds-bvt: 1\""


# Clean up stuff so we can run this more than once.
npm run db:delete:local
npm run db:create:local


clear
###### Begin demo.
# Let’s have one of the students add an annotation, so that later on we can see how the annotation the teacher creates will appear seamlessly alongside the student’s own annotations. For this demo, rather than using the annotation type, I’m going to use text instead, because it makes the data shape simpler -- if I were to use the annotation type I would need to include all of the annotation metadata which will just make more JSON on the commandline and a little more difficult to follow.
 pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"STUDENT_1\", \"key\": \"annotation.contentA.module4.1\", \"type\": \"text\", \"data\": \"I liked this.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# Now the teacher has a class full of 35 students but knows these two students need extra help, so she wants to go in and highlight a section of text. She does this in some application, maybe Ed, I’m not sure. The application shows her a roster and lets her pick which students she wants to share this annotation with. She picks these two students, and the application makes a batch call to UDS to store this annotation for both students.
pe "$CURL $AUTH $SKIP_IDS $CTJ -d '{\"requestor\": \"TEACHER\", \"owner\": \"STUDENT_1\", \"key\": \"annotation.contentA.module4.2\", \"type\": \"text\", \"data\": \"This will be on the quiz.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

pe "$CURL $AUTH $SKIP_IDS $CTJ -d '{\"requestor\": \"TEACHER\", \"owner\": \"STUDENT_2\", \"key\": \"annotation.contentA.module4.2\", \"type\": \"text\", \"data\": \"This will be on the quiz.\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# It’s important to point out that the batch call contains multiple individual calls to UDS. The response from UDS will contain a success or failure for each individual UDS call, so that some of the batch may succeed while the rest fails. If the teacher tries to add another annotation for the same two students and somehow a third student who is not in one of her classes is also part of the batch, this third UDS call will come back as failed.
pe "$CURL $AUTH $CTJ -d '{\"ops\": [{ \"method\": \"data.user.set\", \"args\": {\"requestor\": \"STUDENT_1\", \"key\": \"annotation.contentA.module4.3\", \"type\": \"text\", \"data\": \"I liked this too.\"}}, { \"method\": \"data.user.set\", \"args\": {\"requestor\": \"STUDENT_1\", \"key\": \"annotation.contentA.module4.4\", \"type\": \"annotation\", \"data\": \"This one will fail.\"}}] }' \"$ENDPOINT/api/v1/batch\" | jsonpp"

# Now we can query each student’s annotations. We see that the first student has two annotations, both createdBy the teacher.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"STUDENT_1\", \"keyPrefix\": \"annotation\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# We can get the annotations for the second student, and we see the two annotations from the teacher plus student’s own annotation.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"STUDENT_2\", \"keyPrefix\": \"annotation\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# If the student deciphers the call to UDS and tries to change the annotation created by the teacher to call for a protest of the school administration, UDS allows that because the annotation is stored under the student’s user ID,
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"STUDENT_2\", \"key\": \"annotation.contentA.module4.2\", \"type\": \"text\", \"data\": \"The principal should be fired!\" }' \"$ENDPOINT/api/v1/data.user.set\" | jsonpp"

# but the UDS record makes it very apparent that it is the student who stored the annotation, not the teacher.
pe "$CURL $AUTH $CTJ -d '{\"requestor\": \"STUDENT_2\", \"keyPrefix\": \"annotation\"}' \"$ENDPOINT/api/v1/data.user.query\" | jsonpp"

# finish
p ""
