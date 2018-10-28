const { schema } = require('@chris-lewis/node-common')(['schema']);

const allocator = require('../modules/allocator');
const util = require('../modules/util');

const PORT_MESSAGE_SCHEMA = {
  required: [ 'app', ],
  type: 'object', properties: {
    app: { type: 'string', description: 'Name of the app requesting a port' }
  }
};

module.exports = async (req, res) => {
  if(!schema(req.body, PORT_MESSAGE_SCHEMA)) {
    util.badRequest(res);
    return;
  }

  allocator.getPort(req, res);
};
