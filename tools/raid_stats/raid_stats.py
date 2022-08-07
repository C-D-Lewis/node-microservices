import time
import subprocess
import os

from board import SCL, SDA
import busio
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306

DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), '.')

# Create the I2C interface.
i2c = busio.I2C(SCL, SDA)

# Create the SSD1306 OLED class.
disp = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c)
disp.fill(0)
disp.show()

# Create blank image for drawing with mode '1' for 1-bit color.
width = disp.width
height = disp.height
image = Image.new("1", (width, height))
draw = ImageDraw.Draw(image)

# First define some constants to allow easy resizing of shapes.
padding = -2
top = padding
bottom = height - padding
x = 0

# Resources
font = ImageFont.load_default()
icon_up = Image.open(os.path.join(DIR, 'cloud_up.bmp'))

while True:
  draw.rectangle((0, 0, width, height), outline=0, fill=0)

  cmd = 'cut -f 1 -d " " /proc/loadavg'
  cpuUsage = str(round(float(subprocess.check_output(cmd, shell=True).decode("utf-8").strip()) * 100))
  cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%d/%d", $3,$2}\''
  diskUsage = subprocess.check_output(cmd, shell=True).decode("utf-8")
  cmd = 'cut -f 11 -d " " /proc/mdstat | grep \'\[\''
  devices = subprocess.check_output(cmd, shell=True).decode("utf-8").replace('[', '').replace(']', '')

  draw.text((x, top),      "CPU | " + cpuUsage, font=font, fill=255)
  draw.text((x, top + 8),  "Disk| " + diskUsage, font=font, fill=255)
  draw.text((x, top + 16), "RAID| " + devices, font=font, fill=255)
  draw.text((x, top + 25),  "", font=font, fill=255)

  # Icon
  image.paste(icon_up, (100, 5))

  # Display image
  disp.image(image)
  disp.show()
  time.sleep(5)
