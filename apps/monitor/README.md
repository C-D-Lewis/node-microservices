# monitor

Monitor is a small Node.js application that runs an arbitrary number of plugins
either at an interval, or at specific times of day. These plugins can perform
any function from checking train delays, polling other Node.js services, to
controlling other applications through requests.


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


## Plugin Arguments

Any plugin can be supplied with arguments at runtime specified in the soft
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


## Reusable Plugins

Plugins can also be reused by others to allow instantiation by specifying the
'super class' plugin with `USE` instead of the usual `FILE_NAME`. In this case,
the reusing plugin will be called with the `ARGS` object specified in the
`plugins` item.

For example, to use the `post.js` to call another service at 7pm:

```
"plugins": [
  { "ENABLED": true, "AT": "19:00",
    "USE": "post.js", "ARGS": {
      "URL": "http://192.168.1.107:5007/fade",
      "JSON": { "to": [ 255, 103, 50 ] }
    }
  }
]
```
