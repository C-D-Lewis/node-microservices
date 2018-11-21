#!/bin/sh
until ping -c 1 -W 1 8.8.8.8; do sleep 1; done