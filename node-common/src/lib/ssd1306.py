# python3 ssd1306.py "line 1" "line 2" "line 3" "line 4"

import time
import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import subprocess
import sys

# 128x32 display with hardware I2C:
disp = Adafruit_SSD1306.SSD1306_128_32(rst=None)

disp.begin()
disp.clear()
disp.display()

# Make sure to create image with mode '1' for 1-bit color.
lines = sys.argv[1:5]
top = -2
width = disp.width
height = disp.height
image = Image.new('1', (width, height))
draw = ImageDraw.Draw(image)
font = ImageFont.load_default()

# Draw a black filled box to clear the image.
draw.rectangle((0,0,width,height), outline=0, fill=0)

# Write lines of text.
draw.text((0, top), lines[0], font=font, fill=255)
draw.text((0, top + 8), lines[1], font=font, fill=255)
draw.text((0, top + 16), lines[2], font=font, fill=255)
draw.text((0, top + 25), lines[3], font=font, fill=255)

disp.image(image)
disp.display()
time.sleep(.1)
