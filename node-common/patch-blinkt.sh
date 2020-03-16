#!/bin/bash

npm ci
cd node_modules/node-blinkt
npm uninstall wiringpi-node
npm i --save node-wiring-pi
nano dist/Blinkt.js
