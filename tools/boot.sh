#!/bin/sh
# This combination of shebang and absolute paths appears to work with crontab @reboot

# Wait for network up
/home/pi/node-microservices/tools/wait_for_network.sh

# Run the node's launch configuration
/home/pi/node-microservices/tools/launch-config/run-launch-config.sh
