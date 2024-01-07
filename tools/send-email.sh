#!/bin/bash

set -eu

TO_ADDRESS=$1
SUBJECT=$2
BODY=$3

# Credentials and request details
REGION="eu-west-2"
DATE_STAMP=$(date -u +"%Y%m%d")
FULL_DATE=$(date -u +"%Y%m%dT%H%M%S")

canonical_request="POST\n/v2/email/outbound-emails\n\nhost:email.${REGION}.amazonaws.com\nx-amz-date:${DATE_STAMP}\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
canonical_request_hash=$(echo -n "${canonical_request}" | openssl dgst -sha256 -binary | openssl enc -base64)

string_to_sign="AWS4-HMAC-SHA256\n${DATE_STAMP}\n${REGION}/ses/aws4_request\n${canonical_request_hash}"
signing_key=$(echo -n "AWS4${AWS_SECRET_ACCESS_KEY}" | openssl dgst -sha256 -hmac "AWS4${AWS_SECRET_ACCESS_KEY}" -binary | openssl dgst -sha256 -hmac "${DATE_STAMP}" -binary | openssl dgst -sha256 -hmac "${REGION}" -binary | openssl dgst -sha256 -hmac "ses" -binary | openssl dgst -sha256 -hmac "aws4_request" -binary | openssl enc -base64)

signature=$(echo -n "${string_to_sign}" | openssl dgst -sha256 -hmac "${signing_key}" -binary | openssl enc -base64)

authorization_header="AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${DATE_STAMP}/${REGION}/ses/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}"

curl \
--request POST \
--url https://email.${REGION}.amazonaws.com/v2/email/outbound-emails \
--header "Content-Type: application/json" \
--header "X-Amz-Date: ${FULL_DATE}" \
--header "Authorization: ${authorization_header}" \
--data "{
  \"Destination\": {
    \"ToAddresses\": [
      \"$TO_ADDRESS\"
    ]
  },
  \"Content\": {
    \"Raw\": \"$BODY\",
    \"Subject\": {
      \"Data\": \"$SUBJECT\"
    }
  },
  \"Source\": \"$TO_ADDRESS\"
}"
echo "OK"
