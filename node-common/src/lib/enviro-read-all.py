#!/usr/bin/env python3

import time
from bme280 import BME280
from ltr559 import LTR559
from smbus2 import SMBus

bus = SMBus(1)
bme280 = BME280(i2c_dev=bus)
ltr559 = LTR559()

time.sleep(0.3) # Takes a while to warm up lux

print(bme280.get_temperature())
print(bme280.get_pressure())
print(bme280.get_humidity())
print(ltr559.get_lux())
print(ltr559.get_proximity())
