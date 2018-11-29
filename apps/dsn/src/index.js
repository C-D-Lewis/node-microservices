const { parseString } = require('xml2js');
const { promisify } = require('util');
const { conduit, log } = require('@chris-lewis/node-common')(['conduit', 'log']);
const request = require('request');

const parseStringAsync = promisify(parseString);
const requestAsync = promisify(request);

const DSN_FEED_URL = 'https://eyes.nasa.gov/dsn/data/dsn.xml';
const LED_COLORS = {
  none: [0, 0, 0],
  down: [0, 0, 100],
  up: [153, 204, 255],
  duplex: [148, 0, 211],
};
const INTERVAL_MS = 5000;

const getNonce = () => Math.floor(new Date().getTime() / 5000);

/**
 * Unpick the XML-ness of the data
 */
const digest = (json) => {
  const feed = {
    stations: json.dsn.station.map(p => p.$),
    timestamp: json.dsn.timestamp[0],
  };
  feed.dishes = json.dsn.dish.map((dish) => ({
    metadata: dish.$,
    downSignals: dish.downSignal ? dish.downSignal.map(p => p.$) : [],
    upSignals: dish.upSignal ? dish.upSignal.map(p => p.$) : [],
    targets: dish.target ? dish.target.map(p => p.$) : [],
  }));

  return feed;
};

const getLinkStates = feed => feed.dishes.reduce((res, item) => {
  const downloading = item.downSignals.some(p => p.signalType !== 'none');
  const uploading = item.upSignals.some(p => p.signalType !== 'none');
  if (downloading && uploading) {
    return res.concat('duplex');
  }

  if (downloading) {
    return res.concat('down');
  }

  if (uploading) {
    return res.concat('up');
  }

  return res.concat('none');
}, []);

const update = async () => {
  const { body } = await requestAsync(`${DSN_FEED_URL}?r=${getNonce()}`);
  const json = await parseStringAsync(body);
  const feed = digest(json);

  const ledStates = getLinkStates(feed);
  log.info(ledStates);

  const promises = ledStates
    .map(item => LED_COLORS[item])
    .map((rgb, i) => {
      const packet = { to: 'LedServer', topic: 'setPixel', message: { [i]: rgb } };
      return conduit.send(packet);
    });
  await Promise.all(promises);
};

const main = async () => {
  log.begin();
  await conduit.register();

  setInterval(update, INTERVAL_MS);
};

main();
