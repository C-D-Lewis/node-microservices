const [cmd, ...args] = process.argv.slice(2);

const { clacks } = require('./src/node-common')(['clacks']);

/**
 * The main function.
 */
const main = async () => {
  await clacks.connect();

  if (cmd === 'send') {
    const [topic, ...data] = args;
    const message = JSON.parse(data.join(' '));

    clacks.send(topic, message);
    console.log(`Sent ${JSON.stringify(message)}`);
    return;
  }

  if (cmd === 'subscribe') {
    const [topic] = args;

    clacks.subscribeTopic(topic, console.log);
    console.log(`Subscribed to ${topic}`);
    return;
  }

  throw new Error('Unknown command');
};

main();
