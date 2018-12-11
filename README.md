# node-microservices

This is an ongoing project (since September 2016) that encompasses a set of
small Node microservices that work together to deliver private and public
features. It was originally (and still is) run on a Raspberry Pi running
Raspbian, though nowadays it also runs in the cloud. The aim is to build a
reuable, extensible, and configurable architecture built 'from scratch' as
possible. Therefore elements like common modules, logging, configuration,
inter-app communication are of an original design.


## Installation

* `git clone https://github.com/c-d-lewis/node-microservices`

* `cd node-microservices/apps`

For each app required, install dependencies and perform initial startup:

* `npm i && npm start`

* Finish setting up `config.json` that is generated.


## Launching Apps

Use `runner.js` to launch a full set of apps:

```bash
node runner.js conduit attic led-server monitor
```


## App List

* [`attic`](apps/attic) - Data storage service that allows outside apps to
  POST/GET app-specific data items, stored locally in a variety of formats
  (JSON, Gist, etc.).
* [`backlight-server`](apps/backlight-server) - API service that allows outside
  requests to control snap/fade/Spotify now-playing colors to be set on local
  Raspberry Pi-driven LED lights, such as Mote or Blinkt hats. Backlights as a
  service!
* [`conduit`](apps/conduit) - API service that allows all the other apps to
  communicate, as well as providing a single entry-point for the outside world
  to communicate with any single app, all using a standard message format.
* [`led-server`](apps/led-server) - API service that provides an API between
  other services and the local LED lights hardware. Used by `backlight-server`.
* [`monitor`](apps/monitor) - The oldest service, runs plugin scripts on a timed
  basis to perform generic tasks, including checking weather, train delays,
  uptime status of other services and reporting this all to a variety of
  reporters, such as Google Cloud Messaging.
* [`plug-server`](apps/plug-server) - API service to control local smart
  devices, such as TP-Link Smart Plugs.
* [`service-dashboard`](apps/service-dashboard) - React application that shows
  the status of all local apps running through `conduit`, and provides a GUI for
  their APIs. For example, setting colors for `led-server`.
* [`spotify-auth`](apps/spotify-auth) - Since Spotify requires a static IP for
  callbacks to their API, this service handles responses when `backlight-server`
  wants to know the color of the user's now playing album art, for mood lighting
  purposes.
* [`webhooks`](apps/webhooks) - API service that allows creation and deletion of
  webhook callbacks, and can message other apps locally in response.


## Common

The [`node-common`](node-common) project contains a set of modules that are
commonly used across all of these apps for purposes such as API requests, data
storage, configuration behavior, etc. It is published as an `npm` module for
easy reuse. It also includes a full set of tests, with minimal configuration
required.


## Configuration

Each app has a `config-default.json` that is created if no `config.json` exists,
and in most cases the app will function normally. However, apps that require
special keys (Spotify, DarkSky weather etc.) will not. Each module uses
`config.requireKeys()` to declare a schema that must exist in the app's config
file, or else it will not start. For example:

```js
config.requireKeys('log.js', {
  required: ['LOG'],
  properties: {
    LOG: {
      required: ['APP_NAME', 'LEVEL', 'TO_FILE'],
      properties: {
        APP_NAME: { type: 'string' },
        LEVEL: { type: 'string' },
        TO_FILE: { type: 'boolean' },
      },
    },
  },
});
```


## Communication

The common `conduit` module provides easy access to the locally (or even
remotely) running instance of the `conduit` app, which assigned random ports
and forwards all messages between apps. Apps start by registering and receiving
a port for their own internal web server. Then they register topics they will
respond to (i.e: their API), and optionally provide a schema for those messages
other clients may attempt to send. For example, the `led-server` API:

```js
// Connect and get port
await conduit.register();

// Register listeners for topics, and declare schema for those topic's messages
conduit.on('setAll', require('../api/setAll'), SET_ALL_MESSAGE_SCHEMA);
conduit.on('setPixel', require('../api/setPixel'), INDEXED_MESSAGE_SCHEMA);
conduit.on('blink', require('../api/blink'), INDEXED_MESSAGE_SCHEMA);
```

Then, message can be replied to within the handler:

```js
// For the 'setAll' topic
module.exports = (packet, res) => {
  leds.setAll(packet.message.all);

  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' },
  });
};
```

The `tools/conduit.sh` script can be used to easily send such a message to an
app. For example:

```
./conduit.sh localhost BacklightServer fade '{"all": [0, 0, 0]}'
```

is equivalent to:

```
curl -X POST localhost:5959/conduit -H Content-Type:application/json -d '{
  "to": "BacklightServer",
  "topic": "fade",
  "message": {
    "all": [0, 0, 0]
  }
}'
```

The last parameter (message) is optional for packets that don't require it,
such as status checks:

```
./conduit.sh localhost Attic status
```


## History

What began as a Python script that used the Pebble timeline API to warn me of
train delays and adverse weather conditions, then encompassed the Pebble
timeline pin-pushing apps for News Headlines and Tube Status, before becoming a
personal project to assemble a collection of apps that worked together to do
interesting things, including a novel system of communication for them all.
