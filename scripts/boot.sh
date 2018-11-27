#!/bin/sh

/home/pi/node-microservices/scripts/wait_for_network.sh
cd /home/pi/node-microservices/runner && sudo npm start&

# This combination of shebang and absolute paths appears to work with crontab @reboot
