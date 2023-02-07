# concierge

Configurable webhook service with known webhooks stored in `attic`.

When running, `bifrost` messages can add or remove new webhooks on demand.

If a request is made to service port (default `4665`) to a given webhook's
`url`, the query string of that request is saved in `attic`, using the `url` as
the key. For example, adding the following webhook:

```json
{ "url": "/exampleCallback" }
```

And then sending:

```
POST localhost:4665/exampleCallback?token=7834623
```

Will store this data for another app to retrieve and work with:

```json
{
  "exampleCallback": {
    "value": {
      "token": "7834623"
    },
    "timestamp": 1675804855233
  }
}
```

Note that the `value` is an object, because `req.query` in Express is an object
representing the query string parameters, and is easier to work with.

However, if `packet` is also in the webhook configuration, a hit to that webhook
will be forwarded as a `bifrost` message.


## Setup

1. `npm ci && npm start` to create `config.json`.

2. Optionally add a list of `ENSURED_WEBHOOKS` in `config.json` that should
   always exist.

4. Start the service again to apply the new configuration.


## API

This service provides the following `bifrost` topics and message formats:

### `add`

Add or update a webhook configuration to be stored in `attic`.

Send: `{ url }` or `{ url, packet }`

Receive: `{ content: 'Created' }`

### `remove`

Remove an existing webhook configuration.

Send: `{ url }`

Receive: `{ content: 'Removed' }`
