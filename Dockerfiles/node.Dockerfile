FROM node:20-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /sandbox
USER sandbox

CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.js && \
           echo "$STDIN_DATA" | base64 -d | timeout 10 node /tmp/code.js'
