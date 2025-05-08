# plug-server

API service allowing discovery and control of TP-Link smart plugs.


## Setup

Run `npm ci && npm start` to create `config.yml` and start the service.


## API

This service provides the following `conduit` topics and message formats:

### `getPlugs`

Get details of all known plugs.

Send: N/A

Receive: `{ plugs }`

### `rediscover`

Trigger a manual rediscovery (otherwise every 10 minutes)

Send: N/A

Receive: `{ content: 'Rediscovery started' }`

### `setPlugState`

Set the state of a plug using it's `alias`.

Send: `{ alias, state }`

Receive: `{ content: 'Accepted' }`
