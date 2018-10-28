# node-microservices

This is an ongoing project (since September 2016) that encompasses a set of 
small Node microservices that work together to deliver private and public 
features. It was originally (and still is) run on a Raspberry Pi running 
Raspbian, though nowadays it also runs in the cloud.


## History

What began as a Python script that used the Pebble timeline API to warn me of 
train delays and adverse weather conditions, then encompassed the Pebble 
timeline pin-pushing apps for News Headlines and Tube Status, before becoming a 
personal project to assemble a collection of apps that worked together to do 
interesting things, including a novel system of communication for them all.


## Apps

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
easy reuse.


## Configuration

TODO


## Communication

TODO
