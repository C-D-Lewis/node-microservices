# conduit

Easier inter-pi app communication without manually assigning ports for all services.

The general idea is that each app registers its interest in receiving messages
and listens on the port allocated by this service. Any other service can then
send a request to this service and specify where it should end up.
