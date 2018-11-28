#!/bin/sh
# This combination of shebang and absolute paths appears to work with crontab @reboot

# Wait for network up
/home/pi/node-microservices/scripts/wait_for_network.sh

# Specify names of apps to launch as args in apps.txt
cd /home/pi/node-microservices/runner && sudo npm start $(cat apps.txt) &
