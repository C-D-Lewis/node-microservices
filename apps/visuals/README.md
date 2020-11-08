# visuals

API service allowing control of attached Blinkt! or Mote LED hats and boards.

Allows sharing of LED hardware between any number of other connected apps, such
as for status or alerting with `monitor.`

Can also be used for interactive backlighting, including instant set, gradual
fade, demo mode, and Spotify mode using the dominant color of whatever music is
playing in an authorized Spotify account.


## Setup

1. Run `npm ci && npm start` to create `config.json`.

2. Configure `HARDWARE_TYPE` depending on the attached LED hardware.

3. Configure `AUTH_ATTIC` to a host where Spotify is configured to save callback
   data in `concierge`.

4. Configure `SPOTIFY` client ID and secret from the Spotify developer
   dashboard, as well as details of where `concierge` is watiing for the
   authorization callback (for use in building the authorization URL).

5. Start the service again to apply the new configuration.


## Spotify Mode

The `spotify` topic triggers a flow that allows the LEDs to show the dominant
color of whatever is playing in the authorized Spotify account. Every ten
seconds this is updated, allowing the colors to fade between different songs as
they play.

The setup process:

1. Run `conduit`, `attic`, and `concierge` on a static IP machine, such as in
   AWS, or another hosting provider.

2. Log into the Spotify developer dashboard and create an application in order
   to get a client ID and secret. Put these into `config.json` in the `SPOTIFY`
   block.

3. Add this host with `concierge` port and callback URL in the list of allowed
   callback URLS, such as `http:/46.101.3.163:4665/spotifyCallback`.

To use the feature:

1. Run `visuals` once configured with the Spotify and `concierge` details, and
   send a `spotify` packet to trigger attempted authorization. The first time
   this will fail, and the response will contain the authorization URL allowing
   a Spotify signin to the application.

2. Once signed in, `concierge` will acknowledge with `OK` and the authorization
   `code` will be saved in the static IP instance of `attic`. If this is set as
   the `AUTH_ATTIC`, on the next `spotify` packet `visuals` will read this code
   and use the client ID and secret to full authorize.

3. Once authorized, the colors will fade to that of the album art of the music
   playing every ten seconds until an `off` packet is received.


## API

This service provides the following `conduit` topics and message formats:

### `setAll`

Set all LEDs in the Blinkt! or Mote array to a given color

Send: `{ all: [r, g, b] }`

Receive: `{ content: 'OK' }`

### `setPixel`

Set one or more individual LEDs to a given color.

Send: `{ [n]: [r, g, b] }` where `n` is the LED index. Can be more than one.

Receive: `{ content: 'OK' }`

### `blink`

Same as `setPixel`, but that LED is turned off again after a bried on-period.

### `setText`

Experimental support for OLED display lines of text.

### `state`

Get the last known state of the LEDs.

Send: N/A

Receive: `{ leds }`

### `fadeAll`

Same as `setAll`, but fades to the new color from the last known color.

### `off`

Turn off all LEDs, cancel all animations such as `demo` or `spotify`.

### `demo`

Cycle between one of a set of rainbow colors once every 30 seconds.

### `spotify`

Trigger the Spotify album art color mode mentioned above, once authorized.
