# monitor

Monitor is a small Node.js application that runs an arbitrary number of plugins
either at an interval, or at specific times of day. These plugins can perform
any function from checking train delays, polling other Node.js services, to
controlling other applications through requests.


## Standard Plugins

Adding a plugin is easy. Simply place it in the `plugins` directory and export a
single function as the `exports`. See existing plugins as examples. The plugin
will be called according to its configuration in `config.json`. Specify either
`AT` with a specific time, or `EVERY` to be called at that many minutes
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

For example, a list of services to ping for the `services.js` plugin:

```
"plugins": [
  { "ENABLED": true, "FILE_NAME": "services.js", "EVERY": 10,
    "ARGS": {
      "SERVICES": [
        { "TAG": "NEWS_HEADLINES", "PORT": 5000, "LED": 0 },
        { "TAG": "TUBE_STATUS", "PORT": 5050, "LED": 1 },
        { "TAG": "LED_SERVER", "PORT": 5001, "LED": 2 },
        { "TAG": "ATTIC", "PORT": 5006, "LED": 3 }
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


## Other Features

Plugins benefit from a range of extra functionality from modules in the
`common` directory, including safe soft configuration, Google Cloud Messaging
integration, Gist syncrhonisation,
[`led-server`](https://github.com/C-D-Lewis/led-server) integration, and a
streamlined Express server.