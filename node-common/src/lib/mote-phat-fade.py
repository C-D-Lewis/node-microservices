# python mote-phat-fade.py <fr> <fg> <fb> <tr> <tb> <tg>
# Mirrors on all pixels on channels

import platform
import sys
import time

start_r = int(sys.argv[1])
start_g = int(sys.argv[2])
start_b = int(sys.argv[3])
target_r = int(sys.argv[4])
target_g = int(sys.argv[5])
target_b = int(sys.argv[6])

# Handle not running on Pi
if 'arm' not in platform.machine():
  print('Not running on ARM')
  sys.exit(0)

NUM_CHANNELS = 2
NUM_PIXELS = 16
INTERVAL = 0.01
STEP = 5

import motephat as mote

def main():
  mote.set_clear_on_exit(False)  # Very important
  for c in range(NUM_CHANNELS):
    mote.configure_channel(c + 1, NUM_PIXELS, True)

  current_r = start_r
  current_g = start_g
  current_b = start_b
  while (current_r != target_r and current_g != target_g and current_b != target_g):
    mote.set_all(current_r, current_g, current_b)
    mote.show()

    diff = abs(current_r - target_r)
    current_r += (STEP if diff > STEP else diff) * (-1 if current_r > target_r else 1)
    diff = abs(current_g - target_g)
    current_g += (STEP if diff > STEP else diff) * (-1 if current_g > target_g else 1)
    diff = abs(current_b - target_b)
    current_b += (STEP if diff > STEP else diff) * (-1 if current_b > target_b else 1)
    time.sleep(INTERVAL)

if '__main__' in __name__:
  main()
