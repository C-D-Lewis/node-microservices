# Image (auto) > Write with Raspberry Pi Imager, then re-insert

> Imager allows pre-setup of SSH and WiFi

# Image (manual)
```
sudo dd if=$IMAGE.img of=/dev/$DISK bs=1m
```

## Enable SSH/Wi-Fi
```
touch /Volumes/boot/ssh
```
```
nano /Volumes/boot/wpa_supplicant.conf
```
  ```
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1

  network={
    ssid=""
    psk=""
  }
  ```

# Distro update
```
sudo apt-get update && sudo apt-get upgrade -y
sudo apt full-upgrade
sudo apt-get dist-upgrade
```

# Bash aliases
```
nano ~/.bash_aliases
```
  ```
  alias gs="git status"
  alias gp="git push origin"
  alias gc="git commit -m"
  alias gf="git fetch"
  ```

# git
```
sudo apt install -y git
git config --global credential.helper store
git config --global pull.rebase false
git config --global --add safe.directory /home/pi/code/node-microservices
```

# jq
```
sudo apt install -y jq
```

# node (nvm) & npm (Pi 3 is armv7, Zero is armv6)
> Use nvm where binaries available
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
> Use tools/node/install-node-*.sh for armv6l (Pi Zero)

# npm not found?
> or if not found as sudo in crontab (after nvm installation and nvm alias default)
> which npm/node
```
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm
```

# Setup HTTP server?
```
npm i -g http-server
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/http-server" "/usr/local/bin/http-server"
sudo ln -s /usr/local/bin/http-server /usr/bin/http-server
```

# Docker?

```
curl -sSL https://get.docker.com | sh
```

Add user:

```
sudo usermod -aG docker $USER
```

# Increase swapfile size?

```
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
```

Set `CONF_SWAPSIZE=1024` or other MB value

```
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
sudo reboot
```

# AWS CLI?

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

# Apps
```
cd code
git clone https://github.com/c-d-lewis/node-microservices
```
> install node-common and apps/* dependencies

> setup config.yml for apps/*


# Startup apps with launch-config
```
sudo crontab -e
```
  ```
  @reboot /home/pi/code/node-microservices/launch-config/run.sh /home/pi > /home/pi/crontab.log 2>&1
  ```
