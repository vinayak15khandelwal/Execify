FROM gcc:13

RUN groupadd -r sandbox && useradd -r -g sandbox sandbox

WORKDIR /sandbox

CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.cpp && \
           g++ -O2 -o /tmp/program /tmp/code.cpp 2>&1 && \
           chmod +x /tmp/program && \
           echo "$STDIN_DATA" | base64 -d | timeout 10 /tmp/program'
