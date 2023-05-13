# syntax=docker/dockerfile:1.4

FROM 'node:16-slim'

ENV DOCKER_TEST=1

WORKDIR /code

# Install OS dependencies
RUN apt-get update && apt-get install -y git python3

# Install common dependencies
ADD node-common/package* /code/node-common/
RUN cd /code/node-common && npm ci

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

# Add code
ADD node-common/ /code/node-common/
ADD apps/conduit/ /code/apps/conduit/
ADD apps/attic/ /code/apps/attic/
ADD apps/clacks/ /code/apps/clacks/
ADD apps/concierge/ /code/apps/concierge/
ADD apps/guestlist/ /code/apps/guestlist/
ADD apps/polaris/ /code/apps/polaris/
ADD apps/visuals/ /code/apps/visuals/
ADD apps/monitor/ /code/apps/monitor/

# Configuration
RUN rm /code/apps/**/config.json || exit 0
RUN rm /code/node-common/config.json || exit 0
RUN echo "testPassword" >> /code/apps/guestlist/password
RUN git config --global user.email "test@example.com" \
  && git config --global user.name "Test Name"

# Prepare tests
ADD tools/test-all.sh /code/tools/

CMD tools/test-all.sh
