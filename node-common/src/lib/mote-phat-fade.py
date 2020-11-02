# python mote-phat-fade.py <fr> <fg> <fb> <tr> <tb> <tg>
# Mirrors on all pixels on channels

import platform
import sys
import time

start = [int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])]
target = [int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])]

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

  current = start.copy()
  print(start)
  print(current)
  print(target)

  while current != target:
    mote.set_all(current[0], current[1], current[2])
    mote.show()

    diff = abs(current[0] - target[0])
    current[0] += (STEP if diff > STEP else diff) * (-1 if current[0] > target[0] else 1)
    diff = abs(current[1] - target[1])
    current[1] += (STEP if diff > STEP else diff) * (-1 if current[1] > target[1] else 1)
    diff = abs(current[2] - target[2])
    current[2] += (STEP if diff > STEP else diff) * (-1 if current[2] > target[2] else 1)
    time.sleep(INTERVAL)

if '__main__' in __name__:
  main()
