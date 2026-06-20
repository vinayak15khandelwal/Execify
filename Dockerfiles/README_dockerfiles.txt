# ─────────────────────────────────────────────
# Dockerfiles for Execify language runtimes
# Build with:  docker build -t execify-python  -f Dockerfiles/python.Dockerfile  .
#              docker build -t execify-node    -f Dockerfiles/node.Dockerfile    .
#              docker build -t execify-cpp     -f Dockerfiles/cpp.Dockerfile     .
# ─────────────────────────────────────────────

# ══ Python ══
# Save as: Dockerfiles/python.Dockerfile
# ─────────────────────────────────────────────
# FROM python:3.12-slim
# RUN groupadd -r sandbox && useradd -r -g sandbox sandbox
# WORKDIR /sandbox
# USER sandbox
# # Entrypoint: decode base64 CODE env var and run it
# CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.py && \
#            echo "$STDIN_DATA" | base64 -d | timeout 10 python3 /tmp/code.py'


# ══ Node.js ══
# Save as: Dockerfiles/node.Dockerfile
# ─────────────────────────────────────────────
# FROM node:20-alpine
# RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
# WORKDIR /sandbox
# USER sandbox
# CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.js && \
#            echo "$STDIN_DATA" | base64 -d | timeout 10 node /tmp/code.js'


# ══ C++ ══
# Save as: Dockerfiles/cpp.Dockerfile
# ─────────────────────────────────────────────
# FROM gcc:13
# RUN groupadd -r sandbox && useradd -r -g sandbox sandbox
# WORKDIR /sandbox
# USER sandbox
# CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.cpp && \
#            g++ -O2 -o /tmp/program /tmp/code.cpp 2>&1 && \
#            echo "$STDIN_DATA" | base64 -d | timeout 10 /tmp/program'
