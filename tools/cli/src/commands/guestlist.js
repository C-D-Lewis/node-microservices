const printTable = require('../functions/printTable');
const { send } = require('./conduit');
require('colors');

/**
 * Get all users.
 */
const list = async () => {
  const packet = {
    to: 'guestlist',
    topic: 'getAll',
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  // Print users
  const users = res.message;
  printTable(
    ['id', 'name', 'apps', 'topics', 'devices', 'createdAt'],
    users.map((p) => [
      p.id,
      p.name,
      p.apps,
      p.topics,
      p.devices,
      new Date(p.createdAt).toISOString(),
    ]),
  );
};

/**
 * Create a user.
 *
 * @param {string} name - User name.
 * @param {Array<string>} apps - Apps to permit.
 * @param {Array<string>} topics - Topics to permit.
 * @param {Array<string>} devices - Devices to permit.
 * @param {string} adminPassword - Admin password for user creation.
 */
const create = async (name, apps, topics, devices, adminPassword) => {
  const packet = {
    to: 'guestlist',
    topic: 'create',
    message: {
      name, apps, topics, devices, adminPassword,
    },
  };
  const res = await send({ packet });
  if (res.status !== 201) throw new Error(JSON.stringify(res));

  const user = res.message;
  console.log(`Created user '${user.name}' with token '${user.token}'`);
};

/**
 * Delete a user.
 *
 * @param {string} name - User name.
 * @param {string} adminPassword - Admin password for user creation.
 */
const deleteUser = async (name, adminPassword) => {
  const packet = {
    to: 'guestlist',
    topic: 'delete',
    message: { name, adminPassword },
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log(`Delete user '${name}'`);
};

/**
 * Authorize a token and set of constraints.
 *
 * @param {string} token - Token to check.
 * @param {string} to - App packet is going to.
 * @param {string} topic - Topic in the packet.
 * @param {string} device - Optional device to check.
 */
const authorizeUser = async (token, to, topic, device) => {
  const packet = {
    to: 'guestlist',
    topic: 'authorize',
    message: {
      auth: token, to, topic, device,
    },
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log(`Authorization: ${JSON.stringify(res.message, null, 2)}`.green);
};

module.exports = {
  firstArg: 'guestlist',
  description: 'Work with the guestlist app.',
  operations: {
    list: {
      /**
       * Get all users, minus tokens.
       *
       * @returns {Promise<void>}
       */
      execute: async () => list(),
      pattern: 'list',
    },
    create: {
      /**
       * Create a user.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, name, apps, topics, devices, adminPassword]) => create(
        name,
        apps.split(','),
        topics.split(','),
        devices.split(','),
        adminPassword,
      ),
      pattern: 'create $name $apps $topics $devices $adminPassword',
    },
    delete: {
      /**
       * Delete a user.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, name, adminPassword]) => deleteUser(name, adminPassword),
      pattern: 'delete $name $adminPassword',
    },
    authorize: {
      /**
       * Authorize a token.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, token, to, topic, device]) => authorizeUser(token, to, topic, device),
      pattern: 'authorize $token $to $topic $device',
    },
  },
};
