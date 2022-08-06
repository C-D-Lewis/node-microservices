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

# TODO: Parameterise this to allow multiple clients to write lines
# TODO: Parameterise clear at start option

import sys
import platform

# Parameters
# python pioled-text.py "Hello, world!" "Another line" "line 3" "line 4"
lines = sys.argv[1:5]

# Handle non Pi for testing
if 'arm' not in platform.machine():
  print(lines)
  sys.exit(0)

from board import SCL, SDA
from PIL import Image, ImageDraw, ImageFont
import busio
import adafruit_ssd1306

# Create the I2C interface.
i2c = busio.I2C(SCL, SDA)

# Create the SSD1306 OLED class.
disp = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c)
disp.fill(0)
disp.show()

# Setup drawing
width = disp.width
height = disp.height
image = Image.new('1', (width, height))
draw = ImageDraw.Draw(image)
font = ImageFont.load_default()

# Draw something
draw.rectangle((0, 0, width, height), outline=0, fill=0)
x = 0
y = -2
for line in lines:
  draw.text((x, y), str(line), font=font, fill=255)
  y += 8

# Display image.
disp.image(image)
disp.display()
