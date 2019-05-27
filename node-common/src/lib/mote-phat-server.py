from flask import Flask, request, json

app = Flask(__name__)

def respond(status, payload):
  return app.response_class(
    response=json.dumps(payload),
    status=status,
    mimetype='application/json'
  )

@app.route('/status')
def hello_world():
  return 'OK'

@app.route('/setall', methods=['POST'])
def set_all():
  data = request.json
  if 'all' not in data:
    return respond(400, { 'content': 'Bad Request' })

  print data['all']
  return respond(200, { 'content': 'OK' })