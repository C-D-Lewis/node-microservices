# guestlist

API service to grant credentials and check requests made against them.

Credentials take the following format. For example, a user who can only read
from the Attic service.

TODO: App-specific permissions, such as which attic key can be read.

```json
{
  "name": "Attic User",
  "apps": ["attic"],
  "topics": ["get"]
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
