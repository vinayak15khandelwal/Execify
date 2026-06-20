FROM python:3.12-slim

# Create non-root user for security
RUN groupadd -r sandbox && useradd -r -g sandbox sandbox

WORKDIR /sandbox
USER sandbox

# Decode base64-encoded CODE env var, write to temp file, run with stdin piped in
CMD sh -c 'echo "$CODE" | base64 -d > /tmp/code.py && \
           echo "$STDIN_DATA" | base64 -d | timeout 10 python3 /tmp/code.py'
