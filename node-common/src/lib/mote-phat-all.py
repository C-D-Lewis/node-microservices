# python mote-set-all.py <r> <g> <b>
# Mirrors on all pixels on channels

import platform
import sys

# Handle not running on Pi
r = int(sys.argv[1])
g = int(sys.argv[2])
b = int(sys.argv[3])

# Note: Pi 4 is aarch64, this needs a try catch below instead probably
if 'arm' not in platform.machine():
  print('{} {} {}'.format(r, g, b))
  print('Not running on a Pi, exiting')
  sys.exit(0)

NUM_CHANNELS = 2
NUM_PIXELS = 16

import motephat as mote

def main():
  mote.set_clear_on_exit(False)  # Very important
  for c in range(NUM_CHANNELS):
    mote.configure_channel(c + 1, NUM_PIXELS, True)
  mote.set_all(r, g, b)
  mote.show()

if '__main__' in __name__:
  main()
