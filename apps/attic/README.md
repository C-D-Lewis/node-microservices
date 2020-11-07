# attic

Data storage service for other apps, using a variety of storage types:

* `db` - A local JSON file.

* `gist` - A secret GitHub Gist file synchronized at regular intervals.

* `mongo` - A local MongoDB process.

Data is stored on a per-app basis, so keys are unique within a given app.


## Setup

1. `npm ci && npm start` to create `config.json`.

2. Choose the storage type with `STORAGE_MODE` in `config.json`.

3. Configure that storage mode with the appropriate section of `config.json`.

4. Start the service again to apply the new configuration.


## API

This service provides the following `conduit` topics and message formats:

### `get`

Get a value by key for a given app.

Send: `{ app, key }`

Receive: `{ app, key, value, timestamp }`

### `set`

Set a value by key for a given app.

Send: `{ app, key, value }`

Receive: `{ content: 'OK' }`

### `increment`

Increment a numeric value by key for a given app.

Send: `{ app, key }`

Receive: `{ content: 'OK' }`
