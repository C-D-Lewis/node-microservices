const bifrost = require('../node-common/src/modules/bifrost');

const {
  TOKEN,
} = process.env;
const [server, to, topic, message] = process.argv.slice(2);

/**
 * The main function.
 */
const main = async () => {
  await bifrost.connect({ server });

  const res = await bifrost.send({
    to,
    topic,
    message: message ? JSON.parse(message) : undefined,
    token: TOKEN,
  });
  console.log(res);
  bifrost.disconnect();
};

main();
