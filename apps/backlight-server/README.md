# backlight-server

> Requires [`node-common`](https://github.com/C-D-Lewis/node-common)

Express Node.js server combined with 
[led-server](https://github.com/c-d-lewis/led-server) to make LED-based 
backlights connected and awesome.


## API

* `POST /set    { "to": [r, g, b] }`
* `POST /fade   { "to": [r, g, b] }`
* `POST /demo`
* `POST /off`
* `GET  /status` 
* `POST /spotify`
