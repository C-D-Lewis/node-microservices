# DERIVED FROM:
# https://learn.adafruit.com/monochrome-oled-breakouts/python-usage-2
# SPDX-FileCopyrightText: 2021 ladyada for Adafruit Industries
# SPDX-License-Identifier: MIT

import board
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306

WIDTH = 128
HEIGHT = 32

i2c = board.I2C()  # uses board.SCL and board.SDA
disp = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C)

disp.fill(0)
disp.show()

image = Image.new("1", (disp.width, disp.height))
draw = ImageDraw.Draw(image)
font = ImageFont.load_default()

text = "Hello World!"
draw.text((10, 10), "Hello, world!", font=font, fill=255)

disp.image(image)
disp.show()
