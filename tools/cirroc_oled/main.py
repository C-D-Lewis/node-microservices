#
# Drives display for Cirroc project - icon, CPU, disk usage and RAID status
#

import platform
import time
import subprocess
import os
import socket
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps

DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), '.')

# If we're running on a Pi
RUNNING_ON_PI = 'arm' in platform.machine() or 'aarch64' in platform.machine()

#
# Get local IP address
#
def get_ip_address(ifname):
  s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  s.connect(('10.0.0.0', 0))
  return s.getsockname()[0]

#
# Prepare hardware libraries
#
def prepare_hardware():
  global disp

  import busio
  import adafruit_ssd1306
  from board import SCL, SDA

  # Create the I2C interface.
  i2c = busio.I2C(SCL, SDA)

  # Create the SSD1306 OLED class.
  disp = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c)
  disp.fill(0)
  disp.show()

if RUNNING_ON_PI:
  prepare_hardware()
  width = disp.width
  height = disp.height
else:
  width = 128
  height = 32

# Create blank image for drawing with mode '1' for 1-bit color.
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

#
# Display all stats
#
def draw_display():
  if RUNNING_ON_PI:
    cmd = 'cut -f 1 -d " " /proc/loadavg'
    cpuUsage = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
    cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%d/%d", $3,$2}\''
    diskUsage = subprocess.check_output(cmd, shell=True).decode("utf-8")
    cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%s", $5}\''
    diskPercent = subprocess.check_output(cmd, shell=True).decode("utf-8").replace('%', '').strip()
    cmd = 'cut -f 11 -d " " /proc/mdstat | grep \'\[\''
    devices = subprocess.check_output(cmd, shell=True).decode("utf-8").replace('[', '').replace(']', '')
  else:
    cpuUsage = '1.00'
    diskUsage = '450/900'
    diskPercent = 50
    devices = '2/2'

  # IP
  address = get_ip_address('etho')
  if '/' in address:
    address = address.split('/')[0]
  octets = address.split('.')

  image_draw.text((x, top),      f"{socket.gethostname()} (.{octets[2]}.{octets[3]})", font=font, fill=255)
  image_draw.text((x, top + 8),  "CPU | " + cpuUsage, font=font, fill=255)
  image_draw.text((x, top + 16), "Disk| " + diskUsage, font=font, fill=255)
  image_draw.text((x, top + 25), "RAID| " + devices, font=font, fill=255)

  # Healthy if 2/2
  healthy = devices[0] == devices[2]

  # Icon
  root_x = 94
  if healthy:
    size = 32

    # BG, inverse bar, outer
    image.paste(icon_bg, (root_x, 0))
    bar_x = round((int(diskPercent) / 100) * size)
    image_draw.rectangle([root_x + bar_x, 0, root_x + size, size], fill = 0)
    image.paste(icon_healthy, (root_x, 0), icon_healthy)
  else:
    image.paste(icon_unhealthy, (root_x, 0))

# Main loop
while True:
  # Blank
  image_draw.rectangle((0, 0, width, height), outline=0, fill=0)

  # Display
  if RUNNING_ON_PI:
    # Conserve OLED burn-in
    now = datetime.now()
    # if now.second >= 0 and now.second < 10:
    draw_display()

    disp.image(image)
    disp.show()
  else:
    draw_display()
    image.save('render.png')
    print('Saved render.png')
    exit()

  time.sleep(10)
