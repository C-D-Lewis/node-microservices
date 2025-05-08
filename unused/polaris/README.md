# polaris

Service that monitors public IP of the network and updates a Route53 record
when it changes, allowing services to be hosted on a home network without
needing a permanently assigned IP from the ISP.


## Setup

1. `npm ci && npm start` to create `config.yml`.
2. Update `config.yml` with AWS IAM user credentials with access to Route53.
3. Run with `npm start`.
