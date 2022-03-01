const { schema } = require('../node-common')(['schema']);
const { sendPort } = require('../modules/allocator');
const { sendBadRequest } = require('../modules/util');

/** Schema for a port request request. */
const PORT_MESSAGE_SCHEMA = {
  required: ['app'],
  properties: {
    app: { type: 'string' },  // Name of the app requesting a port allocation
  },
};

/**
 * Handle a request for a port allocation for a service.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const handlePortRequest = async (req, res) => {
  // Check it's a valid request
  if (!schema(req.body, PORT_MESSAGE_SCHEMA)) {
    sendBadRequest(res);
    return;
  }

  sendPort(req, res);
};

module.exports = handlePortRequest;
