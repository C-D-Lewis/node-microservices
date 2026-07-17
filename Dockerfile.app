FROM node:24-alpine

ARG APP

WORKDIR /code

# Install dependencies
COPY node-common /code/node-common
RUN cd node-common && npm ci

# Add app files
COPY apps/$APP /code/apps/$APP
RUN rm -rf /code/apps/**/node_modules

# Install dependencies
RUN cd apps/$APP && npm ci

# Configuration
COPY config.yml /code/config.yml

# Run the apps
WORKDIR /code/apps/$APP

CMD ["npm", "start"]
