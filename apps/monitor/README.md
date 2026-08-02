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
will be called according to its configuration in `config.yml`. Specify either
`AT` with a specific time (or 'start'), `EVERY` to be called at that many minutes
interval.

For example to run `delays.js` every 15 minutes:

```yml
plugins:
  - FILE_NAME: delays.js
    EVERY: 15
```

> Add "ENABLED": false to disable a listed pugin

Any plugin can be supplied with arguments at runtime specified in the
configuration by adding the `ARGS` property as the object to provide at
invocation in the `plugins` item.

For example, a list of scheduled requests to update LED lights:

```yml
plugins:
- FILE_NAME: visuals-scheduler.js
  EVERY: 1
  ARGS:
    EVENTS:
      - NAME: Morning
        'ON': '07:30'
        'OFF': '08:00'
        COLOR:
          - 128
          - 128
          - 128
      - NAME: Nightlight
        'ON': '17:30'
        'OFF': '00:00'
        COLOR:
          - 25
          - 25
          - 25
```

```js
module.exports = args => {
  const { EVENTS } = args;

  // ...
};
```


## Plugin Arguments

The table below details the arguments available for each provided plugin.

### `alarm-test.js`

Test alarms with a random success factor.

### `conduit.js`

Send a Conduit packet on a schedule.

For this plugin, the entire `ARGS` object is the packet to be sent.

### `delays.js`

Show state of select National Rail lines or TfL underground lines. Configuration
is in the constants.

### `email-report.js`

Email the `crontab.log` from device boot after 30 seconds.

### `fan-control.js`

Control connected 40mm fan based on CPU reported temperature.

| Arg Name    | Type   | Description                                                         |
|-------------|--------|---------------------------------------------------------------------|
| `GPIO_PIN`  | Number | GPIO pin on which fan control is connected (FET base, for example). |
| `THRESHOLD` | Number | Minimum temperature to turn on the fan.                             |

### `jinglejam-logger.js`

Log over time the grand total raised during the Yogscast Jingle Jam to a CSV
file.

### `json-datalogger.js`

Log a value from a JSON remote data source to a CSV file.

| Arg Name      | Type   | Description                    |
|---------------|--------|--------------------------------|
| `URL`         | String | URl to fetch.                  |
| `JSON_PATH`   | String | JSONPath to value of interest. |
| `OUTPUT_FILE` | String | Path to output CSV file.       |

### `mdstat.js`

Monitor status of one connected RAID disk array with `/proc/mdstat`.

### `polaris.js`

Implementation of the `polaris` microservice to monitor local public IP and
keep a AWS Route53 record in sync.

| Arg Name             | Type   | Description                      |
|----------------------|--------|----------------------------------|
| `HOSTED_ZONE_NAME`   | String | Hosted zone domain name.         |
| `RECORD_NAME_PREFIX` | String | Prefix to use within the domain. |

### `post.js`

Send a HTTP POST request on a schedule.

| Arg Name | Type   | Description                  |
|----------|--------|------------------------------|
| `URL`    | String | URL to send POST request to. |
| `JSON`   | Object | POST payload data.           |

### `processes.js`

Monitor named processes and alert if their number is too few.

| Arg Name   | Type   | Description                  |
|------------|--------|------------------------------|
| `FILTER`   | String | `ps` filter, such as `java`. |
| `EXPECTED` | Number | Number of expected results.  |

### `rack-oled.js`

If an OLED display is attached, display common stats from the device on it such
as hostname, CPU, memory, etc.

### `rss.js`

Monitor an RSS feed for new entries and sent email when new items are available.

| Arg Name   | Type   | Description                  |
|------------|--------|------------------------------|
| `FEED_URL` | String | URL of the feed to fetch.    |

### `visuals-scheduler.js`

Schedule Visuals lights on and off.

| Arg Name | Type  | Description     |
|----------|-------|-----------------|
| `EVENTS` | Array | List of events. |

Each event has the following structure:

| Arg Name | Type   | Description                            |
|----------|--------|----------------------------------------|
| `NAME`   | String | Name of the event, like 'wakeup glow'. |
| `ON`     | String | `HH:MM` on time.                       |
| `OFF`    | String | `HH:MM` off time.                      |
| `COLOR`  | Array  | RGB numbers for the color to display.  |

### `weather.js`

Show general weather conditions on a single LED, prioritising harsh conditions.

| Arg Name      | Type   | Description                      |
|---------------|--------|----------------------------------|
| `LED`         | Number | Index of LED to show status on.  |
| `DARKSKY_KEY` | String | Darksky API key.                 |
| `LATITUDE`    | Number | Device latitude.                 |
| `LONGITUDE`   | Number | Device longitude.                |
| `TEMP_COLD`   | Number | Minimum comfortable temperature. |
| `TEMP_HOT`    | Number | Maximum comfortable temperature. |

### `web-datalogger.js`

Scrape and log value of a portion of a web page on a schedule.

| Arg Name    | Type   | Description                                            |
|-------------|--------|--------------------------------------------------------|
| `URL`       | String | URL to read.                                           |
| `BEFORES`   | Array  | Array of string portions to help locate start point.   |
| `AFTER`     | String | String after end point.                                |
| `ATTIC_KEY` | String | Key if required to store values in Attic app instance. |

### `z-hotel.js`

Monitor Z Hotel for cheap prices.

| Arg Name          | Type | Description |
|-------------------|------|-------------|
| `START_H`         | Number | Start hour in the day. |
| `DAYS`            | Array | Days of the week to monitor. |
| `PRICE_THRESHOLD` | Number | Price threshold to alert on. |
