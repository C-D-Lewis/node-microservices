# Fan control?
> Prevent  Command failed: vcgencmd measure_temp VCHI initialization failed
```
sudo usermod -aG video pi
```

# Blinkt?
```
curl https://get.pimoroni.com/blinkt | bash
cd node-common && npm i node-blinkt
```

# Mote?
```
curl https://get.pimoroni.com/motephat | bash
```

# PiOLED hat?
```
sudo apt-get install -y python3-pip
sudo pip3 install adafruit-circuitpython-ssd1306
sudo apt-get install -y python3-pil python3-smbus i2c-tools
```
```
sudo raspi-config
```
> enable I2C interface
```
sudo reboot
sudo i2cdetect -y 1
```

# Inky?
```
sudo apt install python-pip
sudo pip install --upgrade pip
sudo pip install inky
```

# Enviro?
```
curl -sSL https://get.pimoroni.com/enviroplus | bash
pip3 install smbus2
```

# GPIO?
```
sudo apt install python3-rpi.gpio # may already be installed
```

# Waveshare E-Paper?
```
sudo apt-get install -y python3-pip python3-pil python3-numpy
sudo pip3 install RPi.GPIO spidev
sudo raspi-config
```
> enable SPI interface

# 128x32 OLED (SSD1306 based)?

> Worked up until Pi 5

```
sudo raspi-config
```
> enable I2C interface
```
sudo reboot
sudo i2cdetect -y 1
```
Dependencies:
```
sudo apt install -y python3-dev python3-smbus i2c-tools python3-pil python3-pip python3-setuptools python3-rpi.gpio
```
Test with an example:
```
git clone https://github.com/adafruit/Adafruit_Python_SSD1306.git
sudo python3 setup.py install
```
Configure so crontab/root can access:
```
sudo groupadd i2c
sudo chown :i2c /dev/i2c-1
sudo chmod g+rw /dev/i2c-1
sudo usermod -aG i2c root
sudo usermod -aG i2c pi
```
Add udev rule (`/etc/udev/rules.d/local.rules`):
```
ACTION=="add", KERNEL=="spidev0.0", MODE="0666"
ACTION=="add", KERNEL=="i2c-[0-1]*", MODE="0666"
ACTION=="add", KERNEL=="dialout", MODE="0666"
ACTION=="add", KERNEL=="ttyACM0", MODE="0666"
ACTION=="add", KERNEL=="ttyAMA0", MODE="0666"
ACTION=="add", KERNEL=="gpio", MODE="0666"
```

## Pi 5?

```
sudo apt-get install -y i2c-tools libgpiod-dev python3-libgpiod
sudo apt install python3-RPi.GPIO
pip3 install --upgrade adafruit-blinka --break-system-packages
pip3 install adafruit-circuitpython-ssd1306 --break-system-packages

sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_serial_hw 0
sudo raspi-config nonint do_ssh 0
sudo raspi-config nonint do_camera 0
sudo raspi-config nonint disable_raspi_config_at_boot 0
```

Try with `blinka_ssd1306_test.py`.
