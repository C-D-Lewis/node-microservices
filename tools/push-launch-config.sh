#!/usr/bin/env bash

export AWS_PROFILE=personal_admin

aws s3 cp launchConfig.json s3://public-files.chrislewis.me.uk
