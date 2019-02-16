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

import time
 
import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306
 
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
 
import subprocess

# Raspberry Pi pin configuration:
RST = None
# Note the following are only used with SPI:
DC = 23
SPI_PORT = 0
SPI_DEVICE = 0
 
# 128x32 display with hardware I2C:
disp = Adafruit_SSD1306.SSD1306_128_32(rst=RST)

# Initialize library.
disp.begin()
 
# Clear display.
disp.clear()
disp.display()
 
# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
width = disp.width
height = disp.height
image = Image.new('1', (width, height))
 
# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)
 
# Draw a black filled box to clear the image.
draw.rectangle((0,0,width,height), outline=0, fill=0)