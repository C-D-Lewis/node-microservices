const { config } = require('..//node-common')(['config']);
const allocator = require('../modules/allocator');
const util = require('../modules/util');

module.exports = async (req, res) => {
  const result = [];
  const apps = allocator.getAll();

  await Promise.all(apps.map(async (item) => {
    const app = Object.assign({}, item);
    const packet = await util.sendPacket({ to: item.app, topic: 'status' });

    app.status = (packet.message && packet.message.content)
      ? packet.message.content
      : JSON.stringify(packet);

    result.push(app);
  }));

  // Report conduit itself for completeness
  result.push({ app: 'conduit', port: config.SERVER.PORT, status: 'OK' });

  res.status(200);
  res.set('Access-Control-Allow-Origin', '*');
  res.send(JSON.stringify(result, null, 2));
};
