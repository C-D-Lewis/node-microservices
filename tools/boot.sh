#!/bin/sh
# This combination of shebang and absolute paths appears to work with crontab @reboot

# Wait for network up
/home/pi/node-microservices/scripts/wait_for_network.sh

# Specify names of apps to launch as args in apps.txt
sudo node /home/pi/node-microservices/runner.js $(cat /home/pi/apps.txt) &
