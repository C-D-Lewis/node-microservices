import time
import subprocess

from board import SCL, SDA
import busio
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306

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

# Draw some shapes.
# First define some constants to allow easy resizing of shapes.
padding = -2
top = padding
bottom = height - padding
x = 0
font = ImageFont.load_default()

while True:
    # Draw a black filled box to clear the image.
    draw.rectangle((0, 0, width, height), outline=0, fill=0)

    # Shell scripts for system monitoring from here:
    # https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load
    cmd = "hostname -I | cut -d' ' -f1"
    IP = subprocess.check_output(cmd, shell=True).decode("utf-8")
    cmd = 'cut -f 1 -d " " /proc/loadavg'
    CPU = subprocess.check_output(cmd, shell=True).decode("utf-8")
    cmd = "free -m | awk 'NR==2{printf \"%s/%s MB %.1f%%\", $3,$2,$3*100/$2 }'"
    MemUsage = subprocess.check_output(cmd, shell=True).decode("utf-8")
    cmd = 'df -h | awk \'$NF=="/mnt/raid1"{printf "%d/%d GB %s", $3,$2,$5}\''
    DiskUsage = subprocess.check_output(cmd, shell=True).decode("utf-8")

    draw.text((x, top + 0),  "IP  |" + IP, font=font, fill=255)
    draw.text((x, top + 8),  "CPU |" + CPU, font=font, fill=255)
    draw.text((x, top + 16), "RAM |" + MemUsage, font=font, fill=255)
    draw.text((x, top + 25), "Disk|" + DiskUsage, font=font, fill=255)

    # Display image.
    disp.image(image)
    disp.show()
    time.sleep(1)
