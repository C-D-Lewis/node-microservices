# syntax=docker/dockerfile:1.4

FROM 'node:16-slim' AS base

# Install OS dependencies
RUN apt-get update && apt-get install -y git python3

FROM base

ENV DOCKER_TEST=1

WORKDIR /code

# Install app dependencies
ADD apps/conduit/package* /code/apps/conduit/
RUN cd /code/apps/conduit && npm ci
ADD apps/attic/package* /code/apps/attic/
RUN cd /code/apps/attic && npm ci
ADD apps/clacks/package* /code/apps/clacks/
RUN cd /code/apps/clacks && npm ci
ADD apps/concierge/package* /code/apps/concierge/
RUN cd /code/apps/concierge && npm ci
ADD apps/guestlist/package* /code/apps/guestlist/
RUN cd /code/apps/guestlist && npm ci
ADD apps/polaris/package* /code/apps/polaris/
RUN cd /code/apps/polaris && npm ci
ADD apps/visuals/package* /code/apps/visuals/
RUN cd /code/apps/visuals && npm ci
ADD apps/monitor/package* /code/apps/monitor/
RUN cd /code/apps/monitor && npm ci

# Install common dependencies (could change most often)
ADD node-common/package* /code/node-common/
RUN cd /code/node-common && npm ci

# Add code
ADD apps/conduit/ /code/apps/conduit/
ADD apps/attic/ /code/apps/attic/
ADD apps/clacks/ /code/apps/clacks/
ADD apps/concierge/ /code/apps/concierge/
ADD apps/guestlist/ /code/apps/guestlist/
ADD apps/polaris/ /code/apps/polaris/
ADD apps/visuals/ /code/apps/visuals/
ADD apps/monitor/ /code/apps/monitor/
ADD node-common/ /code/node-common/

# Config cleanup
RUN rm /code/apps/**/config.json || exit 0
RUN rm /code/node-common/config.json || exit 0
RUN git config --global user.email "test@example.com" \
  && git config --global user.name "Test Name"

# Set test data
RUN echo "testPassword" >> /code/apps/guestlist/password
COPY <<EOF /code/apps/conduit/config.json
{
  "OPTIONS": {
    "FLEET": {
      "HOST": "",
      "DEVICE_TYPE": ""
    },
    "AUTH_GUESTLIST": "localhost"
  },
  "CONDUIT": {
    "TOKEN": ""
  },
  "SERVER": {
    "PORT": 5959
  },
  "CLACKS": {
    "SERVER": "localhost"
  }
}
EOF

COPY <<EOF /code/apps/attic/db.json
{
  "guestlist": {
    "users": {
      "value": [
        {
          "id": "6f482b3ba6a6d41a",
          "name": "testUser",
          "apps": [
            "all"
          ],
          "topics": [
            "all"
          ],
          "token": "32a77a47a43f67acd9b53f6b195842722bf3a2cb",
          "createdAt": 1684063071964
        }
      ],
      "timestamp": 1684063071967
    }
  }
}
EOF

# Prepare tests
ADD tools/test-all.sh /code/tools/

CMD tools/test-all.sh
