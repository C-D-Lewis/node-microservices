# guestlist

API service to grant credentials and check requests made against them when
used in conjunction with `conduit` for external requests.

Credentials take the following format. For example, a user who can only read
from the Attic service:

```json
{
  "name": "AtticUser",
  "apps": ["attic"],
  "topics": ["get", "set"]
}
```

Or a super-admin:

```json
{
  "name": "superadmin",
  "apps": ["all"],
  "topics": ["all"]
}
```


## Setup

Before use, create a file `password` at the app directory containing the desired
admin password that must be specified when creating other users. This file
should be installed when connecting to the machine locally:

```bash
npm ci && npm start &

echo 'MyAdminPassword' > ./password
```

This will then be picked up immediately and used to validate all `create`
requests.


## Creating New Users

> Users represent real users, or devices, and so should have all the permissions
> they need to talk to all the apps they will talk to.

New users are created with `conduit` messages where `auth` is the admin
password:

```json
{
  "to": "guestlist",
  "topic": "create",
  "auth": "MyAdminPassword",
  "message": {
    "name": "BacklightUser",
    "apps": ["ambience"],
    "topics": ["set", "fade", "off"]
  }
}
```

The response will contain the user's access token which can **only be viewed
at this one time**:

```json
{
  "status": 201,
  "message": {
    "id": "165dacd16a253b28",
    "name": "BacklightUser",
    "apps": ["ambience"],
    "topics": ["set","fade","off"],
    "token": "b6aacf6f46dbdd24659b537f7754506eb4aa5638",
    "createdAt": 1586599862140
  }
}
```


## User Requests

After creation, a user may then connect to the `apps` and `topics` specified
by including their token as the `auth` field in a `conduit` request:

```json
{
  "to": "ambience",
  "topic": "off",
  "auth": "b6aacf6f46dbdd24659b537f7754506eb4aa5638"
}
```

Apps that communicate with a token should include it as `TOKEN` in their
`conduit` config.
