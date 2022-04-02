const printTable = require('../functions/printTable');
const { send } = require('./conduit');

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
    ['id', 'name', 'apps', 'topics', 'createdAt'],
    users.map((p) => [p.id, p.name, p.apps, p.topics, new Date(p.createdAt).toISOString()]),
  );
};

/**
 * Create a user.
 *
 * @param {string} name - User name.
 * @param {Array<string>} apps - Apps to permit.
 * @param {Array<string>} topics - Topics to permit.
 * @param {string} adminPassword - Admin password for user creation.
 */
const create = async (name, apps, topics, adminPassword) => {
  const packet = {
    to: 'guestlist',
    topic: 'create',
    message: { name, apps, topics },
    auth: adminPassword,
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
const _delete = async (name, adminPassword) => {
  const packet = {
    to: 'guestlist',
    topic: 'delete',
    message: { name },
    auth: adminPassword,
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log(`Delete user '${name}'`);
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
      execute: async ([, name, apps, topics, adminPassword]) => create(name, apps.split(','), topics.split(','), adminPassword),
      pattern: 'create $name $apps $topics $adminPassword',
    },
    delete: {
      /**
       * Delete a user.
       *
       * @param {Array<string>} args - Command args.
       * @returns {Promise<void>}
       */
      execute: async ([, name, adminPassword]) => _delete(name, adminPassword),
      pattern: 'delete $name $adminPassword',
    },
  },
};
