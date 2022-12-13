#!/usr/bin/env python3

import time
from bme280 import BME280
from ltr559 import LTR559

bme280 = BME280()
ltr559 = LTR559()

time.sleep(1) # Takes a while to warm up lux

# Seems first couple of values are always the same
for i in range(0, 3):
  bme280.get_temperature()
  time.sleep(0.5) # Sleep makes value change
  bme280.get_pressure()

# Get the temperature of the CPU for compensation
# https://github.com/pimoroni/enviroplus-python/blob/master/examples/compensated-temperature.py
def get_cpu_temperature():
  with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
    temp = f.read()
    temp = int(temp) / 1000.0
  return temp

# Tuning factor for compensation. Decrease this number to adjust the
# temperature down, and increase to adjust up
factor = 2.25
cpu_temps = [get_cpu_temperature()] * 5
cpu_temp = get_cpu_temperature()
cpu_temps = cpu_temps[1:] + [cpu_temp]  # Smooth out with some averaging to decrease jitter
avg_cpu_temp = sum(cpu_temps) / float(len(cpu_temps))
raw_temp = bme280.get_temperature()
comp_temp = raw_temp - ((avg_cpu_temp - raw_temp) / factor)

# Interface is one measurement per line, in this order
print(raw_temp)
print(comp_temp)
print(bme280.get_pressure())
print(bme280.get_humidity())
print(ltr559.get_lux())
print(ltr559.get_proximity())
