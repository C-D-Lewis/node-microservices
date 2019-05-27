#!/bin/bash
pip install -r requirements.txt

export FLASK_APP=mote-phat-server.py
python -m flask run --host=0.0.0.0 --port 35275