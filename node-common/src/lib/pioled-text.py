'''
sudo apt-get update
sudo apt-get install build-essential python-dev python-pip
sudo pip install RPi.GPIO
sudo apt-get install python-imaging python-smbus
sudo apt-get install git
git clone https://github.com/adafruit/Adafruit_Python_SSD1306.git (fork was created to C-D-Lewis)
cd Adafruit_Python_SSD1306
sudo python setup.py install

<enable i2c in raspi-config>
<halt and install PiOLED hat>

test: sudo python examples/stats.py
'''

# TODO: Parameterise this to allow multiple clients
# TODO: Parameterise clear at start

import sys
import time
import subprocess

import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

# Parameters
# python pioled-text.py "Hello, world!" 0 false
text = sys.argv[1]
line_number = int(sys.argv[2])
clear_all = sys.argv[3] == 'True' || sys.argv[3] == 'true'

# 128x32 display with hardware I2C:
RST = None
disp = Adafruit_SSD1306.SSD1306_128_32(rst=RST)
disp.begin()
disp.clear()
disp.display()

width = disp.width
height = disp.height
image = Image.new('1', (width, height))
draw = ImageDraw.Draw(image)
font = ImageFont.load_default()

# Draw something
draw.rectangle((0, 0, width, height), outline=0, fill=0)
x = 0
top = 0
draw.text((x, top + (8 * line_number)), str(text), font=font, fill=255)

# Display image.
disp.image(image)
disp.display()
