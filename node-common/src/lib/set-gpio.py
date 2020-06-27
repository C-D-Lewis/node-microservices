#!/usr/bin/python3

import sys
import RPi.GPIO as GPIO

def main():
  pin = int(sys.argv[1])
  state = int(sys.argv[2])

  GPIO.setmode(GPIO.BCM)
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, state)
  print('set {} to {}'.format(pin, state))

if '__main__' in __name__:
  main()
