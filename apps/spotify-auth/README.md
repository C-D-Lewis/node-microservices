# spotify-auth

> Requires [`node-common`](https://github.com/C-D-Lewis/node-common)

Microservice Node.js app to authenticate with the Spotify API (Authorization 
code grant) and supply 
[backlight-server](https://github.com/C-D-Lewis/backlight-server) with the 
dominant colour of the user's currently now playing album art for LED 
backlighting purposes.


## API

* `GET /callback`
* `GET /color`
