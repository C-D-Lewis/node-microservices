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
          "devices": [
            "all"
          ],
          "hash": "800af9c9acb31ac36c561ed4e5a3da890398237de72dccb5e9419d63a384c2ee",
          "createdAt": 1684063071964
        },
        {
          "id": "6f482b3ba6a6d41a",
          "name": "legacyNoDevices",
          "apps": [
            "all"
          ],
          "topics": [
            "all"
          ],
          "hash": "f82559394470730bbbe04225ba10a2ad9d08bde3f08c315e3279b8d2ceda63ff",
          "createdAt": 1684063071964
        },
        {
          "id": "455be0dc3417413612a1f5b41f342f9f",
          "name": "singleDevice",
          "apps": [
            "all"
          ],
          "topics": [
            "all"
          ],
          "devices": [
            "Marvin"
          ],
          "hash": "2fae139be5bc98d65d93ddcaa0f0abcb5b7b4a22be91e6e2dfbaedd6baa2481d",
          "createdAt": 1709069485842
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
