# python mote-set-array.py <[[r,g,b] * 16]>
# E.g: python mote-set-array.py "[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]"

import json
import platform
import sys

# Handle not running on Pi
json_arr = json.loads(sys.argv[1])
if platform.machine() != 'armv7l':
  print('{}'.format(json_arr))
  raise SystemExit

NUM_CHANNELS = 2
NUM_PIXELS = 16

import motephat as mote

def set_all():
  for c in range(NUM_CHANNELS):
    for p in range(0, len(json_arr)):
      pixel_arr = json_arr[p]
      mote.set_pixel(c + 1, p, int(pixel_arr[0]), int(pixel_arr[1]), int(pixel_arr[2]))
  mote.show()

def main():
  mote.set_clear_on_exit(False)
  for c in range(NUM_CHANNELS):
    mote.configure_channel(c + 1, NUM_PIXELS, True)
  set_all()

if '__main__' in __name__:
  main()
