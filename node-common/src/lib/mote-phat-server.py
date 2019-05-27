import platform
import sys

if 'arm' not in platform.machine():
  print('{} {} {}'.format(r, g, b))
  sys.exit(0)

from flask import Flask, request, json
import motephat as mote

NUM_CHANNELS = 2
NUM_PIXELS = 16

app = Flask(__name__)

def respond(status, payload):
  return app.response_class(
    response=json.dumps(payload),
    status=status,
    mimetype='application/json'
  )

def mote_init():
  mote.set_clear_on_exit(False)  # Very important
  for c in range(NUM_CHANNELS):
    mote.configure_channel(c + 1, NUM_PIXELS, True)

def _moteupdate(r, g, b):
  mote.set_all(r, g, b)
  mote.show()

@app.route('/status')
def status():
  return 'OK'

@app.route('/setall', methods=['POST'])
def set_all():
  data = request.json
  if 'all' not in data:
    return respond(400, { 'content': 'Bad Request' })

  rgb = data['all']
  _moteupdate(rgb[0], rgb[1], rgb[2])
  return respond(200, { 'content': 'OK' })

def main():
  mote_init()

if '__main__' in __name__:
  main()