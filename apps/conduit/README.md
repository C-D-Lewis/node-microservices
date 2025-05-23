# conduit

Central app that allows easy inter-app communication via passing standard format
messages between them. Also acts as a single point of entry to the ecosystem of
apps.


## Setup

> Note: this app must be started before any others, since they register on
> each start.

1. `npm ci && npm start` to create `config.yml`.

3. Optionally configure features in `config.yml`.

4. Start the service again to apply the new configuration.


## API

This service provides the following HTTP API via Express:

### `GET /ping`

Check service is available. Responds `{ pong: true }`.

### `POST /conduit`

Send a message to another app via this node, always on port `5959`. For example:

```
POST localhost:5959/conduit
Content-Type: application/json

{
  "to": "attic",
  "topic": "set",
  "message": {
    "app": "exampleApp",
    "key": "uptime",
    "value": "1889478"
  }
}
```

For a host other than localhost, `host` may also be specified to relay the
message to a remote instance of `conduit`.

When `AUTH_ENABLED` is set, and user tokens are required to secure who can send
messages, `auth` must also be provided.

A further example using these features:

```
POST localhost:5959/conduit
Content-Type: application/json

{
  "to": "visuals",
  "topic": "spotify",
  "host": "46.101.3.163",
  "auth": "e89466796a4e75283cdf76c83574b54602601b0e"
}
```

### `GET /port`

As an app, request which port should be listened to on the app's internal server
so that `conduit` knows how to send messages to it. A repeated request with the
same `app` name will receive the same port originally allocated.

```
GET localhost:5959/port
Content-Type: application/json

{
  "app": "exampleApp"
}
```

When using `node-common`, this is as simple as:

```js
await conduit.register({ appnName });
```
