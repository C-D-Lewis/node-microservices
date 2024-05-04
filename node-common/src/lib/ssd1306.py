# python3 ssd1306.py "line 1" "line 2" "line 3" "line 4"

import time
import board
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
import sys

WIDTH = 128
HEIGHT = 32

i2c = board.I2C()  # uses board.SCL and board.SDA
disp = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C)

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
disp.show()
time.sleep(.1)
