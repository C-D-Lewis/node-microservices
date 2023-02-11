# node-microservices

![](docs/overview.png)

This is an ongoing project (since September 2016) that encompasses a set of
small Node microservices that work together to deliver private and public
features. It was originally (and still is) run on a Raspberry Pi running
Raspbian, though nowadays it can also in the cloud. The aim is to build a
reuable, extensible, and configurable architecture built 'from scratch' as
possible. Therefore elements like common modules, logging, configuration,
inter-app communication are of an original design.

* [Installation](#installation)
* [Launching Apps](#launching-apps)
* [App List](#app-list)
* [Dashboard List](#dashboard-list)
* [Common Modules](#common-modules)
* [Configuration](#configuration)
* [Communication](#communication)
* [Authentication](#authentication)


## Installation

For each app in `apps` or dashboard in `dashboards`, install dependencies and
perform initial startup:

1. `npm ci && npm start`

2. Finish setting up `config.json` that is generated.

Lastly, setup the `node-common` module, shared by all apps:

1. `cd node-common`

2. `npm ci`


## Launching Apps

Use `tools/runner.js` to launch a full set of apps:

```bash
node runner.js bifrost attic visuals monitor
```


## App List

* [`attic`](apps/attic) - Data storage service that allows other apps to
  POST/GET app-specific data items, stored locally in a variety of formats
  (JSON, Gist, MongoDB, etc.).
* [`concierge`](apps/concierge) - API service that allows creation and deletion
  of webhook callbacks, and handles POST requests to those callbacks by saving
  payloads received, or forwarding them on via `bifrost`.
* [`bifrost`](apps/bifrost) - WebSocket service that allows all the other apps to
  communicate, as well as providing a single entry-point for the outside world
  to communicate with any single app, using a standard message format.
* [`guestlist`](apps/guestlist) - API service that grants and checks user access
  tokens. Master access is granted via a local file for the admin.
* [`monitor`](apps/monitor) - The oldest service, runs plugins and scripts on a
  timed basis to perform generic tasks, including checking weather, train
  delays, uptime status of other services, and updating LED lights on schedule.
* [`visuals`](apps/visuals) - API service that provides an API between
  other services and the local LED lights hardware. Also provides animations and
  Spotify album art color integration.
* [`polaris`](apps/polaris) - Service that monitors the local network's public
  IP address and keeps an AWS Route53 record in sync, removing the need for a
  permanent IP to be assigned from the ISP.


## Dashboard List

* [`service-dashboard`](apps/service-dashboard) - React application that shows
  the status of all local apps running through `bifrost`, and provides a GUI for
  their APIs. For example, setting colors for `visuals`.
* [`lighting-dashboard`](apps/service-dashboard) - React application showing an
  easy to use card of colors and shortcuts for `visuals` APIS, such as Spotify
  mode.


## Common Modules

The [`node-common`](node-common) project contains a set of modules that are
commonly used across all of these apps for purposes such as API requests, data
storage, configuration behavior, schema validation, logging, etc.

```js
const { log, bifrost } = require('../node-common')(['log', 'bifrost']);
```


## Configuration

Each app has a `config-default.json` that is created if no `config.json` exists,
and in most cases the app will function normally. However, apps that require
special keys (Spotify, DarkSky weather etc.) will not. Each module uses
`config.withSchema()` to declare a partial schema that must exist in the app's
config file, or else it will not start. For example, app logging:

```js
const { LOG } = config.withSchema('log.js', {
  required: ['LOG'],
  properties: {
    LOG: {
      required: ['APP_NAME'],
      properties: {
        APP_NAME: { type: 'string' },
      },
    },
  },
});
```


## Communication

The common `bifrost` module provides easy access to the locally (or even
remotely) running instance of the `bifrost` app, which connects apps together
and forwards all messages between them. Apps start by connecting to the
WebSocket server, then they register topics they will respond to
(i.e: their API), and provide a schema for those messages
other clients may attempt to send. For example, the `visuals` API:

```js
// Connect and get port
await bifrost.connect({ server });

// Register listeners for topics, and declare schema for those topic's messages
bifrost.registerTopic('setAll', require('../api/setAll'), SET_ALL_SCHEMA);
bifrost.registerTopic('setPixel', require('../api/setPixel'), INDEXED_SCHEMA);
bifrost.registerTopic('blink', require('../api/blink'), INDEXED_SCHEMA);
```

Then, message can be replied to within the handler by returning data or throwing
an error:

```js
// For the 'setAll' topic
module.exports = (packet) => {
  // Update the LEDs hardware
  leds.setAll(packet.message.all);

  // Respond to the packet sender
  return { content: 'OK' };
};
```

### Testing Communication

The `tools/bifrost.js` script can be used to easily send such a message to an
app. For example:

```bash
# Fade to black
./bifrost.js localhost visuals fadeAll '{"all": [0, 0, 0]}'
```

The last parameter (message) is optional for packets that don't require it,
such as status checks:

```bash
./bifrost.js localhost attic status
```

The only exception is when a `guestlist` auth token is required (i.e: when not
from `localhost`). The token is obtained from the app-local `config.json` as
the `BIFROST.TOKEN` value (see below).


## Authentication

For all requests that do not originate from `localhost`, each packet received
by `bifrost` must include the `token` field with a token that is then
verified by `guestlist`, though this can be disabled. Where applicable
additional checks are done on the `apps` and `topics` permissions assigned to
that user.

For example, creating a user as the admin with the master password (see
[`guestlist`](apps/guestlist) for details):

```json
{
  "to": "guestlist",
  "topic": "create",
  "adminPassword": "MyAdminPassword",
  "message": {
    "name": "BacklightUser",
    "apps": ["visuals"],
    "topics": ["set", "fadeAll", "off"]
  }
}
```

The response will contain a one-time view of the token that may be given to the
user for their requests:

```json
{
  "id": "165dacd16a253b28",
  "name": "BacklightUser",
  "apps": ["visuals"],
  "topics": ["set","fadeAll","off"],
  "token": "b6aacf6f46dbdd24659b537f7754506eb4aa5638",
  "createdAt": 1586599862140
}
```

Such an example request simply uses the token as the `token` parameter:

```json
{
  "to": "visuals",
  "topic": "off",
  "token": "b6aacf6f46dbdd24659b537f7754506eb4aa5638"
}
```


## History

What began as a Python script that used the Pebble timeline API to warn me of
train delays and adverse weather conditions, then encompassed the Pebble
timeline pin-pushing apps for News Headlines and Tube Status, before becoming a
personal project to assemble a collection of apps that worked together to do
interesting things, including a novel system of communication for them all.
Until 2023, central communication was done with HTTP and randomly assigned ports
via the `conduit` app, this was later replaced with a WebSocket server and
`async/await` implemented on top for convenience.
