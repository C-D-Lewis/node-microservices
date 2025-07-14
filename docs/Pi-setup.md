# Pi Setup

## Use script?

Can use `tools/setup-pi.sh` to do most of this.

## Distro update
```
sudo apt-get update && sudo apt-get upgrade -y
sudo apt full-upgrade
sudo apt-get dist-upgrade
```

## Bash aliases
```
nano ~/.bash_aliases
```

```
alias gs="git status"
alias gp="git push origin"
alias gc="git commit -m"
alias gf="git fetch"
```

## git
```
sudo apt install -y git
git config --global credential.helper store
git config --global pull.rebase false
git config --global --add safe.directory /home/pi/code/node-microservices
```

## jq
```
sudo apt install -y jq
```

## node (nvm) & npm (Pi 3 is armv7, Zero is armv6)
> Use nvm where binaries available
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
> Use tools/node/install-node-*.sh for armv6l (Pi Zero)

## npm not found?
> or if not found as sudo in crontab (after nvm installation and nvm alias default)
> which npm/node
```
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm
```

## Setup HTTP server?
```
npm i -g http-server
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/http-server" "/usr/local/bin/http-server"
sudo ln -s /usr/local/bin/http-server /usr/bin/http-server
```

## Docker?

```
curl -sSL https://get.docker.com | sh
```

Add user:

```
sudo usermod -aG docker $USER
```

## Increase swapfile size?

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

## AWS CLI?

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Then setup credentials with `aws configure`.

## Disable WiFi?

In `/boot/firmware/config.txt`:

```
dtoverlay=disable-wifi
```

## Apps
```
cd code
git clone https://github.com/c-d-lewis/node-microservices
```
> install node-common and apps/* dependencies

> setup config.yml for apps/*

Remember to set up any accessory libraries required for attached hardware.


## Startup apps with launch-config
```
sudo crontab -e
```
  ```
  @reboot /home/pi/code/node-microservices/launch-config/run.sh /home/pi > /home/pi/crontab.log 2>&1
  ```
