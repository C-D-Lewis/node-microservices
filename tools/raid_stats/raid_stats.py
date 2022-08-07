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
image_draw = ImageDraw.Draw(image)

# First define some constants to allow easy resizing of shapes.
padding = -2
top = padding
bottom = height - padding
x = 0

# Resources
font = ImageFont.load_default()
icon_healthy = Image.open(os.path.join(DIR, 'cloud_healthy.bmp'))
icon_unhealthy = Image.open(os.path.join(DIR, 'alert.bmp'))
icon_bg = Image.open(os.path.join(DIR, 'cloud.bmp'))

while True:
  image_draw.rectangle((0, 0, width, height), outline=0, fill=0)

  cmd = 'cut -f 1 -d " " /proc/loadavg'
  cpuUsage = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
  cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%d/%d", $3,$2}\''
  diskUsage = subprocess.check_output(cmd, shell=True).decode("utf-8")
  cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%s", $5}\''
  diskPercent = subprocess.check_output(cmd, shell=True).decode("utf-8").replace('%', '').strip()
  cmd = 'cut -f 11 -d " " /proc/mdstat | grep \'\[\''
  devices = subprocess.check_output(cmd, shell=True).decode("utf-8").replace('[', '').replace(']', '')

  image_draw.text((x, top),      "CPU | " + cpuUsage, font=font, fill=255)
  image_draw.text((x, top + 8),  "Disk| " + diskUsage, font=font, fill=255)
  image_draw.text((x, top + 16), "RAID| " + devices, font=font, fill=255)
  image_draw.text((x, top + 25),  "", font=font, fill=255)

  # Healthy if 2/2
  healthy = devices[0] == devices[2]

  # Icon
  if healthy:
    root_x = 94
    size = 32

    # BG, inverse bar, outer
    image.paste(icon_bg, (root_x, 0))
    x = round((int(diskPercent) / 100) * size)
    w = size - x
    image_draw.rectangle([root_x + x, 0, root_x + size, size], fill = 0)
    image.paste(icon_healthy, (root_x, 0))
  else:
    image.paste(icon_unhealthy, (root_x, 0))

  # Display image
  disp.image(image)
  disp.show()
  time.sleep(5)
