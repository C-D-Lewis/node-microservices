FROM node:20-alpine

ARG APP

WORKDIR /code

# Install dependencies
COPY node-common /code/node-common
RUN cd node-common && npm ci

# Add files
COPY apps/$APP /code/apps/$APP
RUN rm -rf /code/apps/**/node_modules

RUN cd apps/$APP && npm ci

COPY config.yml /code/config.yml

# Run the apps
WORKDIR /code/apps/$APP

CMD ["npm", "start"]
