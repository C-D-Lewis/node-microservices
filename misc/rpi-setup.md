# Image (auto) > Write with Raspberry Pi Imager, then re-insert
>Imager allows pre-setup of SSH and WiFi

# Image (manual)
sudo dd if=2021-01-11-raspios-buster-armhf-lite.img of=/dev/disk2s1 bs=1m

## Enable SSH/Wi-Fi
touch /Volumes/boot/ssh
nano /Volumes/boot/wpa_supplicant.conf
> Enter the following content:
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
  ssid=""
  psk=""
}

# Distro update
sudo apt-get update && sudo apt-get upgrade
sudo apt full-upgrade
sudo apt-get dist-upgrade

# Bash aliases
> In .bash_aliases
alias gs="git status"
alias gp="git push origin"
alias gc="git commit -m"
alias gf="git fetch"

# git
sudo apt install git
git config --global credential.helper store
git config --global pull.rebase false

# jq
sudo apt install jq

# node (nvm) & npm (Pi 3 is armv7, Zero is armv6)
> Use nvm where binaries available
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
> Use tools/install-node-14-armv6l.sh for armv6l (Zero)
npm i -g npm@^7

# npm not found?
> or if not found as sudo in crontab (after nvm installation and nvm alias default)
> which npm/node
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm

# Setup HTTP server?
npm i -g http-server
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/http-server" "/usr/local/bin/http-server"
sudo ln -s /usr/local/bin/http-server /usr/bin/http-server

# Apps
git clone https://github.com/c-d-lewis/node-microservices
> install node-common and apps/* dependencies
> setup config.json for apps/*

# Fan control?
> Prevent  Command failed: /opt/vc/bin/vcgencmd measure_temp VCHI initialization failed
sudo usermod -aG video pi

# Blinkt?
curl https://get.pimoroni.com/blinkt | bash
cd node-common && npm i node-blinkt

# Mote?
curl https://get.pimoroni.com/motephat | bash

# PiOLED?
sudo apt-get install python3-pip
sudo pip3 install adafruit-circuitpython-ssd1306
sudo apt-get install -y python3-pil python3-smbus i2c-tools
sudo raspi-config
> enable I2C interface
sudo reboot
sudo i2cdetect -y 1

# Inky?
sudo apt install python-pip
sudo pip install --upgrade pip
sudo pip install inky

# Enviro?
curl -sSL https://get.pimoroni.com/enviroplus | bash

# GPIO?
sudo apt install python3-rpi.gpio (may already be installed)

# Waveshare E-Paper?
sudo apt-get install python3-pip python3-pil python3-numpy
sudo pip3 install RPi.GPIO spidev
sudo raspi-config
> enable SPI interface

# Startup apps with launch-config
sudo crontab -e
@reboot /home/pi/code/node-microservices/launch-config/run.sh /home/pi > /home/pi/crontab.log 2>&1
