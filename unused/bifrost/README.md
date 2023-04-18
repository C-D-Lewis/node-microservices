# bifrost

WebSocket server with additional transactional layer, allowing responses to be
awaited at the application level. Alternative to `conduit` that uses HTTP.

## Packet format

```
{
  id,
  replyId,
  route,
  message: {
    error
  }
}
```

* `id` - ID of a new packet.
* `replyId` - Same as ID, present in a response packet.
* `route` - Route to the topic, in the format `/$TYPE/$HOSTNAME/$FROM_APP/$TO_APP/$TOPIC`
* `message` - Payload data for the app.
* `message.error` - Present if the response is an error.


## node-common library

The node common `bifrost.js` library allows easy connection, registering topics
the app supports, and asynchronously responding to message:

```js
await bifrost.connect();

bifrost.registerTopic('getTime', () => ({ time: Date.now() }));
```

In another app:

```js
const { time } = await bifrost.send({ to: 'TimeApp', topic: 'getTime' });
```
