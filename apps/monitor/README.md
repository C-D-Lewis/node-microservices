# monitor

Monitor is a small Node.js application that runs an arbitrary number of plugins
either at an interval, or at specific times of day. These plugins can perform
any function from checking train delays, polling other Node.js services, to
controlling other applications through requests.

- [Standard Plugins](#standard-plugins)
- [Plugin Arguments](#plugin-arguments)


## Standard Plugins

Adding a plugin is easy. Simply place it in the `plugins` directory and export a
single function as the `exports`. See existing plugins as examples. The plugin
will be called according to its configuration in `config.json`. Specify either
`AT` with a specific time (or 'start'), `EVERY` to be called at that many minutes
interval.

For example to run `delays.js` every 15 minutes:

```
"plugins": [
  { "ENABLED": true, "FILE_NAME": "delays.js", "EVERY": 15 }
]
```

Any plugin can be supplied with arguments at runtime specified in the
configuration by adding the `ARGS` property as the object to provide at
invocation in the `plugins` item.

For example, a list of scheduled requests to update LED lights:

```
"plugins": [
  { "ENABLED": true, "FILE_NAME": "visuals-scheduler.js", "EVERY": 1,
    "ARGS": {
      "EVENTS": [
        { "NAME": "Morning", "ON": "07:30", "OFF": "08:00", "COLOR": [128, 128, 128] },
        { "NAME": "Nightlight", "ON": "17:30", "OFF": "00:00", "COLOR": [25, 25, 25] },
      ]
    }
  }
]
```

```js
module.exports = args => {
  const { EVENTS } = args;

  // ...
};
```


## Plugin Arguments

The table below details the arguments available for each provided plugin.

### `8hr-forecast.js`

Show a forecast of one hour per LED on a Mote or Blinkt strip.

| Name | Type | Description |
|------|------|-------------|
| `LED` | Number | Index of LED on connected Mote/Blinkt strip to use for error state. |
| `DARKSKY_KEY` | String | Darksky API key. |
| `LATITUDE` | Number | Device latitude. |
| `LONGITUDE` | Number | Device longitude. |
| `HOURS_AHEAD` | Number | Number of hours ahead to look. |
| `TEMP_COLD` | Number | Minimum comfortable temperature. |
| `TEMP_HOT` | Number | Maximum comfortable temperature. |

### `delays.js`

Show state of select National Rail lines on connected LEDs.

| Name | Type | Description |
|------|------|-------------|
| `LED` | Number | Index of LED to use. |

### `devices.js`

Disused.

### `enviro-datalogger.js`

Datalog sensor values from Enviro HAT to file.

This plugin has no `ARGS` required.

### `fan-control.js`

Control connected 40mm fan based on CPU reported temperature.

| Name | Type | Description |
|------|------|-------------|
| `GPIO_PIN` | Number | GPIO pin on which fan control is connected (FET base, for example). |
| `THRESHOLD` | Number | Minimum temperature to turn on the fan. |

### `mdstat.js`

Monitor status of one connected RAID disk array with `/proc/mdstat`.

This plugin has no `ARGS` required.

### `post.js`

Send a HTTP POST request on a schedule.

| Name | Type | Description |
|------|------|-------------|
| `URL` | String | URL to send POST request to. |
| `JSON` | Object | POST payload data. |

### `services.js`

Monitor state of local or remote `node-microservices` apps.

| Name | Type | Description |
|------|------|-------------|
| `HOST` | String | Host where apps are running. |
| `LED` | Number | Index of LED to use for status display. |

### `visuals-scheduler.js`

Schedule Visuals lights on and off.

| Name | Type | Description |
|------|------|-------------|
| `EVENTS` | Array | List of events. |

Each event has the following structure:

| Name | Type | Description |
|------|------|-------------|
| `NAME` | String | Name of the event, like 'wakeup glow'. |
| `ON` | String | `HH:MM` on time. |
| `OFF` | String | `HH:MM` off time. |
| `COLOR` | Array | RGB numbers for the color to display. |

### `weather.js`

Show general weather conditions on a single LED, prioritising harsh conditions.

| Name | Type | Description |
|------|------|-------------|
| `LED` | Number | Index of LED to show status on. |
| `DARKSKY_KEY` | String | Darksky API key. |
| `LATITUDE` | Number | Device latitude. |
| `LONGITUDE` | Number | Device longitude. |
| `TEMP_COLD` | Number | Minimum comfortable temperature. |
| `TEMP_HOT` | Number | Maximum comfortable temperature. |

### `web-datalogger.js`

Scrape and log value of a portion of a web page on a schedule.

| Name | Type | Description |
|------|------|-------------|
| `URL` | String | URL to read. |
| `BEFORES` | Array | Array of string portions to help locate start point. |
| `AFTER` | String | String after end point. |
| `ATTIC_KEY` | String | Key if required to store values in Attic app instance. |
